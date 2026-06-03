"use client";

import { extractUserRecordFromPayload } from "@/lib/dashboard-user-storage";
import {
  olympxAuthenticatedFetch,
  olympxProxyUrl,
} from "@/lib/olympx/authenticated-fetch";
import { resolveCreateClientToken } from "@/lib/olympx/resolve-create-client-token";

export type OlympxUserProfilePayload = Record<string, unknown>;

function unwrapUserFromProfilePayload(payload: unknown): Record<string, unknown> | null {
  return extractUserRecordFromPayload(payload);
}

async function getJsonWithBearer(path: string, accessToken?: string | null): Promise<unknown> {
  const res = await olympxAuthenticatedFetch(olympxProxyUrl(path), {
    method: "GET",
    accessToken,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text.trim() || `Request failed (${res.status})`);
  }

  const text = await res.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

/**
 * Fetch the logged-in user's profile using the stored bearer token.
 * Laravel Scribe documents this as GET /api/me (not /api/v1/auth/me).
 */
export async function fetchOlympxUserProfile(): Promise<OlympxUserProfilePayload | null> {
  const token = await resolveCreateClientToken();
  if (!token) return null;

  const candidates = [
    process.env.NEXT_PUBLIC_OLYMPX_PROFILE_PATH,
    "api/me",
    "api/v1/me",
    "api/v1/auth/me",
    "api/v1/auth/profile",
    "api/v1/profile",
    "api/v1/user",
    "api/v1/users/me",
  ].filter((v): v is string => typeof v === "string" && v.trim().length > 0);

  let lastError: unknown = null;
  for (const path of candidates) {
    try {
      const raw = await getJsonWithBearer(path, token);
      const u = unwrapUserFromProfilePayload(raw);
      if (u) return u;
    } catch (e) {
      lastError = e;
    }
  }

  if (lastError) throw lastError;
  return null;
}
