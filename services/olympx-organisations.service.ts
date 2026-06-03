"use client";

import {
  olympxAuthenticatedFetch,
  olympxProxyUrl,
} from "@/lib/olympx/authenticated-fetch";
import {
  buildCreateOrganisationPayload,
  type CreateOrganisationInput,
} from "@/lib/olympx/build-organisation-form-data";
import {
  extractOrganisationFromResponse,
  type CreatedOrganisationRef,
} from "@/lib/olympx/extract-organisation-from-response";
import { ensureCreateSession } from "@/lib/olympx/ensure-create-session";
import { resolveCreateClientToken } from "@/lib/olympx/resolve-create-client-token";
import {
  mapOrganisationApiFieldErrors,
  parseOlympxValidationErrors,
  type CreateOrganisationFieldErrors,
} from "@/lib/validations/organisation";
import {
  isOlympxHttpError,
  OlympxHttpError,
} from "@/services/olympx-auth.service";

const BFF_CREATE_URL = "/api/organisations";

function organisationsApiUrl(): string {
  const path =
    process.env.NEXT_PUBLIC_OLYMPX_ORGANISATIONS_PATH?.replace(/^\/+/, "") ??
    "api/v1/organisations";
  return olympxProxyUrl(path);
}

function networkErrorMessage(): string {
  return [
    "Could not reach the API from your browser.",
    "Start the Laravel app, set OLYMPEX_API_BASE_URL in .env.local, restart Next.js, then try again.",
  ].join(" ");
}

function errorMessageFromBody(
  data: unknown,
  status: number,
  rawText: string,
): string {
  if (typeof data !== "object" || data === null) {
    return rawText.trim() || `Request failed (${status})`;
  }
  const o = data as Record<string, unknown>;
  const errors = o.errors;
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    for (const v of Object.values(errors)) {
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === "string") {
        return v[0];
      }
      if (typeof v === "string") return v;
    }
  }
  if (typeof o.message === "string") return o.message;
  return rawText.trim() || `Request failed (${status})`;
}

async function parseResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const msg = errorMessageFromBody(data, res.status, text);
    throw new OlympxHttpError(msg, res.status, data);
  }

  return typeof data === "object" && data !== null
    ? (data as Record<string, unknown>)
    : {};
}

async function postCreateOrganisationOnce(
  url: string,
  payload: ReturnType<typeof buildCreateOrganisationPayload>,
  accessToken?: string | null,
): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await olympxAuthenticatedFetch(url, {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const isFetchFailed =
      raw === "Failed to fetch" ||
      /failed to fetch|networkerror|load failed|network request failed/i.test(raw);
    throw new OlympxHttpError(
      isFetchFailed ? networkErrorMessage() : raw,
      0,
      e,
    );
  }

  return parseResponse(res);
}

async function postCreateOrganisation(
  payload: ReturnType<typeof buildCreateOrganisationPayload>,
  accessToken?: string | null,
): Promise<Record<string, unknown>> {
  const urls = [BFF_CREATE_URL, organisationsApiUrl()];
  let lastError: unknown;

  for (const url of urls) {
    try {
      return await postCreateOrganisationOnce(url, payload, accessToken);
    } catch (e) {
      lastError = e;
      if (isOlympxHttpError(e) && (e.status === 401 || e.status === 403 || e.status === 422)) {
        throw e;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new OlympxHttpError("Could not create organization.", 0, lastError);
}

export class OlympxOrganisationValidationError extends Error {
  readonly fieldErrors: CreateOrganisationFieldErrors;
  readonly status: number;

  constructor(
    message: string,
    fieldErrors: CreateOrganisationFieldErrors,
    status: number,
  ) {
    super(message);
    this.name = "OlympxOrganisationValidationError";
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

export function isOlympxOrganisationValidationError(
  e: unknown,
): e is OlympxOrganisationValidationError {
  return e instanceof OlympxOrganisationValidationError;
}

/**
 * POST /api/v1/organisations — BFF `/api/organisations` then olympx proxy fallback.
 */
export async function olympxCreateOrganisation(
  input: CreateOrganisationInput,
  options?: { accessToken?: string | null },
): Promise<CreatedOrganisationRef> {
  const payload = buildCreateOrganisationPayload(input);
  const session = await ensureCreateSession(options?.accessToken);
  if (!session.canCreate) {
    throw new OlympxHttpError(
      "Sign in required to create an organization.",
      401,
      null,
    );
  }
  let accessToken = session.token ?? (await resolveCreateClientToken(options?.accessToken));

  let response: Record<string, unknown>;
  try {
    response = await postCreateOrganisation(payload, accessToken);
  } catch (e) {
    if (isOlympxHttpError(e) && e.status === 401) {
      const retrySession = await ensureCreateSession(options?.accessToken);
      accessToken =
        retrySession.token ??
        (await resolveCreateClientToken(options?.accessToken));
      if (!retrySession.canCreate && !accessToken) {
        throw e;
      }
      try {
        response = await postCreateOrganisation(payload, accessToken);
      } catch (retryErr) {
        if (isOlympxHttpError(retryErr) && retryErr.status === 422) {
          const apiErrors = parseOlympxValidationErrors(retryErr.body);
          const fieldErrors = mapOrganisationApiFieldErrors(apiErrors);
          throw new OlympxOrganisationValidationError(
            retryErr.message,
            fieldErrors,
            422,
          );
        }
        throw retryErr;
      }
    } else if (isOlympxHttpError(e) && e.status === 422) {
      const apiErrors = parseOlympxValidationErrors(e.body);
      const fieldErrors = mapOrganisationApiFieldErrors(apiErrors);
      throw new OlympxOrganisationValidationError(e.message, fieldErrors, 422);
    } else if (isOlympxHttpError(e) && e.status === 403) {
      throw new OlympxHttpError(
        "You do not have permission to create organizations. Sign out, sign in again with OTP, then retry.",
        403,
        e.body,
      );
    } else {
      throw e;
    }
  }

  const created = extractOrganisationFromResponse(response);
  if (created) return created;

  if (payload.slug) return { slug: payload.slug };

  throw new OlympxHttpError(
    "Organization was created but no slug was returned in the API response.",
    200,
    response,
  );
}

export type OrganisationListItem = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  settings?: Record<string, unknown> | null;
  teams_count?: number;
};

function parsePaginatedOrganisations(
  payload: Record<string, unknown>,
): OrganisationListItem[] {
  const data = payload.data;
  if (!Array.isArray(data)) return [];

  return data
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null)
    .map((row) => ({
      id: Number(row.id),
      name: String(row.name ?? ""),
      slug: String(row.slug ?? ""),
      description:
        typeof row.description === "string" ? row.description : null,
      website: typeof row.website === "string" ? row.website : null,
      settings:
        row.settings && typeof row.settings === "object"
          ? (row.settings as Record<string, unknown>)
          : null,
      teams_count:
        typeof row.teams_count === "number"
          ? row.teams_count
          : Array.isArray(row.teams)
            ? row.teams.length
            : undefined,
    }))
    .filter((row) => row.slug.length > 0);
}

async function getOrganisations(
  accessToken?: string | null,
  params?: { search?: string; per_page?: number },
): Promise<OrganisationListItem[]> {
  const url = new URL(organisationsApiUrl(), "http://localhost");
  if (params?.search?.trim()) {
    url.searchParams.set("search", params.search.trim());
  }
  url.searchParams.set("per_page", String(params?.per_page ?? 50));

  const res = await olympxAuthenticatedFetch(url.pathname + url.search, {
    method: "GET",
    accessToken,
  });

  const payload = await parseResponse(res);
  return parsePaginatedOrganisations(payload);
}

/** GET /api/v1/organisations — organisations visible to the signed-in user. */
export async function olympxListOrganisations(options?: {
  accessToken?: string | null;
  search?: string;
}): Promise<OrganisationListItem[]> {
  const accessToken = await resolveCreateClientToken(options?.accessToken);
  return getOrganisations(accessToken, {
    search: options?.search,
    per_page: 50,
  });
}

export { isOlympxHttpError };
