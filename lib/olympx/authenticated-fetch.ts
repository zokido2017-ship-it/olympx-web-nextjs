"use client";

import { resolveCreateClientToken } from "@/lib/olympx/resolve-create-client-token";

export type OlympxAuthenticatedFetchInit = RequestInit & {
  accessToken?: string | null;
  /** Public endpoints — do not attach bearer token. */
  skipAuth?: boolean;
};

/** Build headers with bearer token for proxied Olympx API calls. */
export async function buildOlympxAuthHeaders(
  explicitToken?: string | null,
): Promise<Headers> {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  const token = await resolveCreateClientToken(explicitToken);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("X-Olympx-Access-Token", token);
  }
  return headers;
}

/** Browser fetch to Next.js `/api/olympx/*` with session cookie + bearer token. */
export async function olympxAuthenticatedFetch(
  input: string,
  init: OlympxAuthenticatedFetchInit = {},
): Promise<Response> {
  const { accessToken, skipAuth, headers: initHeaders, ...rest } = init;

  const headers = skipAuth
    ? new Headers(initHeaders ?? undefined)
    : await buildOlympxAuthHeaders(accessToken);

  if (initHeaders) {
    new Headers(initHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return fetch(input, {
    ...rest,
    headers,
    credentials: "include",
    cache: rest.cache ?? "no-store",
  });
}

/** Resolve `/api/olympx/<path>` URL from a Laravel-relative path segment. */
export function olympxProxyUrl(relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, "");
  return `/api/olympx/${normalized}`;
}
