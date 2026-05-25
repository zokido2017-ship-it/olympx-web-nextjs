"use client";

import { readOlympxAccessToken } from "@/lib/olympx/session";

export type OlympxUserProfilePayload = Record<string, unknown>;

function unwrapUserFromProfilePayload(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  const d = o.data;
  if (d && typeof d === "object" && !Array.isArray(d)) return d as Record<string, unknown>;
  const u = o.user;
  if (u && typeof u === "object" && !Array.isArray(u)) return u as Record<string, unknown>;
  return o;
}

async function getJsonWithBearer(path: string, token: string): Promise<unknown> {
  const normalized = path.replace(/^\/+/, "");
  const res = await fetch(`/api/olympx/${normalized}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
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
 * The exact endpoint varies by backend, so we try a small set of common paths.
 */
export async function fetchOlympxUserProfile(): Promise<OlympxUserProfilePayload | null> {
  const token = readOlympxAccessToken();
  if (!token) return null;

  const candidates = [
    process.env.NEXT_PUBLIC_OLYMPX_PROFILE_PATH,
    "api/v1/auth/me",
    "api/v1/auth/profile",
    "api/v1/me",
    "api/v1/profile",
    "api/v1/user",
    "api/v1/users/me",
  ].filter((v): v is string => typeof v === "string" && v.trim().length > 0);

  let lastError: unknown = null;
  for (const path of candidates) {
    try {
      const raw = await getJsonWithBearer(path, token);
      const u = unwrapUserFromProfilePayload(raw);
      return u ?? null;
    } catch (e) {
      lastError = e;
    }
  }

  if (lastError) throw lastError;
  return null;
}

