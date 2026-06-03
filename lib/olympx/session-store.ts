/**
 * Session cookie read helpers (safe for middleware, API routes, and client bundles).
 * Server write path: session-cookie-server.ts (uses next/headers).
 */
import type { NextRequest } from "next/server";

import { readTokenFromCookieHeader } from "@/lib/olympx/parse-request-cookie";
import {
  decodeSessionCookieValue,
  encodeSessionCookieValue,
} from "@/lib/olympx/session-cookie-codec";
import { OLYMPX_ACCESS_TOKEN_KEY } from "@/lib/olympx/session-constants";

export const SESSION_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 60; // 60 days

/** Cookie options shared by session Route Handlers (readable in JS for guards + middleware). */
export function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SEC,
    httpOnly: false,
    secure: isProd,
    sameSite: "lax" as const,
  };
}

export { encodeSessionCookieValue, decodeSessionCookieValue };

/** Read decoded bearer token from middleware/proxy requests (Cookie header). */
export function readSessionTokenFromRequest(
  request: NextRequest | Request,
): string | null {
  const rawCookieHeader = request.headers.get("cookie");
  const fromHeader = readTokenFromCookieHeader(
    rawCookieHeader,
    OLYMPX_ACCESS_TOKEN_KEY,
  );
  if (fromHeader) {
    const decoded = decodeSessionCookieValue(fromHeader);
    if (decoded?.trim()) return decoded.trim();
  }

  if ("cookies" in request && typeof request.cookies?.get === "function") {
    const fromNext = (request as NextRequest).cookies.get(
      OLYMPX_ACCESS_TOKEN_KEY,
    )?.value;
    if (fromNext) {
      const decoded = decodeSessionCookieValue(fromNext);
      if (decoded?.trim()) return decoded.trim();
    }
  }

  return null;
}

export function hasSessionTokenOnRequest(
  request: NextRequest | Request,
): boolean {
  return Boolean(readSessionTokenFromRequest(request));
}

export function maskSessionToken(token: string): string {
  if (token.length <= 8) return "[redacted]";
  return `${token.slice(0, 4)}… (len=${token.length})`;
}
