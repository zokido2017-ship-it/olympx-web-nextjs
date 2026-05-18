import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { authDebug } from "@/lib/olympx/auth-debug";
import { isSameSiteRequest as sameSiteOk } from "@/lib/olympx/same-site-request";
import { OLYMPX_ACCESS_TOKEN_KEY } from "@/lib/olympx/session-constants";

const MAX_AGE_SEC = 60 * 60 * 24 * 60; // 60 days

/** Lets the client confirm the middleware session cookie exists (avoids login/dashboard loops). */
export async function GET(req: Request) {
  if (!sameSiteOk(req)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const jar = await cookies();
  const v = jar.get(OLYMPX_ACCESS_TOKEN_KEY)?.value?.trim();
  if (v) {
    return NextResponse.json({ ok: true as const });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  authDebug("api:olympx-session", "POST received", { origin, host });
  if (!sameSiteOk(req)) {
    authDebug("api:olympx-session", "rejected: cross-origin", {
      origin,
      host,
      reason: "Origin/Host not same-site (see same-site-request.ts loopback rules)",
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token =
    typeof body === "object" &&
    body !== null &&
    "token" in body &&
    typeof (body as { token: unknown }).token === "string"
      ? (body as { token: string }).token.trim()
      : "";

  if (!token) {
    authDebug("api:olympx-session", "rejected: missing token");
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  authDebug("api:olympx-session", "token accepted, setting cookie", {
    token: `${token.slice(0, 4)}… (len=${token.length})`,
  });
  const res = NextResponse.json({ ok: true as const });
  res.cookies.set(OLYMPX_ACCESS_TOKEN_KEY, token, {
    path: "/",
    maxAge: MAX_AGE_SEC,
    sameSite: "lax",
    // Must NOT be HttpOnly: middleware + `readOlympxAccessToken()` / RequireOlympxAuth
    // must see the same session. HttpOnly hides the cookie from JS → dashboard loads with
    // a valid cookie but token === null → /login ↔ /dashboard loop.
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });

  authDebug(
    "api:olympx-session",
    "session cookie set for middleware + client (readable from document.cookie)",
    { key: OLYMPX_ACCESS_TOKEN_KEY },
  );

  return res;
}

export async function DELETE(req: Request) {
  authDebug("api:olympx-session", "DELETE received");
  if (!sameSiteOk(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true as const });
  res.cookies.delete(OLYMPX_ACCESS_TOKEN_KEY);
  return res;
}
