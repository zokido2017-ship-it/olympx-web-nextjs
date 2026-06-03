"use client";

import {
  olympxAuthenticatedFetch,
  olympxProxyUrl,
} from "@/lib/olympx/authenticated-fetch";
import {
  buildCreateTeamPayload,
  type CreateTeamInput,
} from "@/lib/olympx/build-team-form-data";
import {
  extractTeamFromResponse,
  type CreatedTeamRef,
} from "@/lib/olympx/extract-team-from-response";
import { resolveCreateClientToken } from "@/lib/olympx/resolve-create-client-token";
import {
  isOlympxHttpError,
  OlympxHttpError,
} from "@/services/olympx-auth.service";

const CREATE_TEAM_API = "/api/teams";

export type OlympxSportOption = {
  id: number;
  name: string;
  slug?: string;
};

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

async function authedFetch(
  url: string,
  init: RequestInit & { accessToken?: string | null },
): Promise<Record<string, unknown>> {
  const { accessToken, ...requestInit } = init;
  let res: Response;
  try {
    res = await olympxAuthenticatedFetch(url, {
      ...requestInit,
      accessToken,
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

function unwrapSportsList(payload: Record<string, unknown>): OlympxSportOption[] {
  const raw = payload.data;
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)
      ? ((raw as { data: unknown[] }).data ?? [])
      : [];

  const out: OlympxSportOption[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = o.id;
    const name = o.name;
    if (typeof id !== "number" && typeof id !== "string") continue;
    if (typeof name !== "string" || !name.trim()) continue;
    out.push({
      id: typeof id === "number" ? id : Number.parseInt(id, 10),
      name: name.trim(),
      slug: typeof o.slug === "string" ? o.slug : undefined,
    });
  }
  return out.filter((s) => Number.isFinite(s.id));
}

/** Load sports for the create-team discipline dropdown. */
export async function fetchOlympxSports(
  accessToken?: string | null,
): Promise<OlympxSportOption[]> {
  const path =
    process.env.NEXT_PUBLIC_OLYMPX_SPORTS_PATH?.replace(/^\/+/, "") ??
    "api/v1/sports";

  const payload = await authedFetch(olympxProxyUrl(path), {
    method: "GET",
    accessToken,
  });
  return unwrapSportsList(payload);
}

/** POST /api/v1/teams via Next.js route (injects bearer from client + cookies). */
export async function olympxCreateTeam(
  input: CreateTeamInput,
  options?: { accessToken?: string | null },
): Promise<CreatedTeamRef> {
  const accessToken = await resolveCreateClientToken(options?.accessToken);
  const { json, formData } = buildCreateTeamPayload(input);

  let response: Record<string, unknown>;
  if (formData) {
    response = await authedFetch(CREATE_TEAM_API, {
      method: "POST",
      body: formData,
      accessToken,
    });
  } else {
    response = await authedFetch(CREATE_TEAM_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json),
      accessToken,
    });
  }

  const created = extractTeamFromResponse(response, input.name.trim());
  if (created) return created;

  throw new OlympxHttpError(
    "Team was created but no identifier was returned in the API response.",
    200,
    response,
  );
}

export { isOlympxHttpError };
