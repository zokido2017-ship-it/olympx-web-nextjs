import { NextResponse } from "next/server";

import { authDebug } from "@/lib/olympx/auth-debug";
import { isSameSiteRequest as sameSiteOk } from "@/lib/olympx/same-site-request";
import { OLYMPX_ACCESS_TOKEN_KEY } from "@/lib/olympx/session-constants";
import {
  encodeSessionCookieValue,
  readSessionTokenFromRequest,
  sessionCookieOptions,
} from "@/lib/olympx/session-store";

/** Lets the client confirm the middleware session cookie exists (avoids login/dashboard loops). */
export async function GET(req: Request) {
  if (!sameSiteOk(req)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const token = readSessionTokenFromRequest(req)?.trim();
  if (token) {
    return NextResponse.json({ ok: true as const });
  }
  const cookieHeader = req.headers.get("cookie");
  const rawPresent = Boolean(
    cookieHeader?.includes(`${OLYMPX_ACCESS_TOKEN_KEY}=`),
  );
  authDebug("api:olympx-session", "GET: no session cookie on request", {
    key: OLYMPX_ACCESS_TOKEN_KEY,
    cookieHeaderPresent: Boolean(cookieHeader),
    rawKeyPresent: rawPresent,
    decodeFailed: rawPresent,
  });
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
  res.cookies.set(
    OLYMPX_ACCESS_TOKEN_KEY,
    encodeSessionCookieValue(token),
    sessionCookieOptions(),
  );

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
