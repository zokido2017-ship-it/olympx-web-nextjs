import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { authDebug } from "@/lib/olympx/auth-debug";
import { trace, traceToken } from "@/lib/olympx/auth-flow-trace";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/olympx/default-post-login";
import { isSameSiteRequest } from "@/lib/olympx/same-site-request";
import { encodeSessionCookieValue } from "@/lib/olympx/session-cookie-codec";
import { OLYMPX_ACCESS_TOKEN_KEY } from "@/lib/olympx/session-constants";
import { sessionCookieOptions } from "@/lib/olympx/session-store";

export const SESSION_COMPLETE_UI_PATH = "/auth/session-complete";

/** Delay before client navigation so the browser commits Set-Cookie (303 often drops it). */
const COOKIE_COMMIT_MS = 120;

export function resolveSessionCompleteDestination(
  rawNext: string | null | undefined,
): string {
  if (rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")) {
    return rawNext;
  }
  return DEFAULT_POST_LOGIN_PATH;
}

export async function readSessionCompleteBody(request: NextRequest): Promise<{
  token: string;
  next: string | null;
}> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as {
        token?: unknown;
        next?: unknown;
      };
      return {
        token: typeof body.token === "string" ? body.token.trim() : "",
        next: typeof body.next === "string" ? body.next : null,
      };
    } catch {
      return { token: "", next: null };
    }
  }

  try {
    const form = await request.formData();
    const nextVal = form.get("next");
    return {
      token: String(form.get("token") ?? "").trim(),
      next: typeof nextVal === "string" ? nextVal : null,
    };
  } catch {
    return { token: "", next: null };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildCookieCommitHtml(continuePath: string): string {
  const safePath = escapeHtml(continuePath);
  const jsPath = JSON.stringify(continuePath);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Signing you in…</title>
</head>
<body>
<p style="font-family:system-ui,sans-serif;text-align:center;margin-top:40vh;color:#666">
Signing you in…
</p>
<script>
setTimeout(function () {
  location.replace(${jsPath});
}, ${COOKIE_COMMIT_MS});
</script>
<noscript>
<meta http-equiv="refresh" content="1;url=${safePath}">
</noscript>
</body>
</html>`;
}

/**
 * Form POST handler: Set-Cookie then 200 HTML bridge (not 303).
 * Browsers often drop Set-Cookie on 303 after a form POST; the short delay
 * lets the cookie jar commit before navigating to the session-complete UI.
 */
export async function handleSessionCompletePost(
  request: NextRequest,
): Promise<NextResponse> {
  if (!isSameSiteRequest(request)) {
    trace("session.complete.fail", { reason: "cross_origin" });
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const { token, next: bodyNext } = await readSessionCompleteBody(request);
  const destPath = resolveSessionCompleteDestination(
    bodyNext ?? request.nextUrl.searchParams.get("next"),
  );

  if (!token) {
    trace("session.complete.fail", { reason: "missing_token" });
    const login = new URL("/login", request.url);
    login.searchParams.set("next", destPath);
    return NextResponse.redirect(login, 303);
  }

  traceToken("session.complete.ok", token);

  const continueUrl = new URL(SESSION_COMPLETE_UI_PATH, request.url);
  continueUrl.searchParams.set("next", destPath);
  const continuePath = `${continueUrl.pathname}${continueUrl.search}`;

  authDebug("session-complete-post", "Set-Cookie + 200 HTML bridge", {
    destPath,
    continuePath,
    key: OLYMPX_ACCESS_TOKEN_KEY,
    commitDelayMs: COOKIE_COMMIT_MS,
  });

  const response = new NextResponse(buildCookieCommitHtml(continuePath), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

  response.cookies.set(
    OLYMPX_ACCESS_TOKEN_KEY,
    encodeSessionCookieValue(token),
    sessionCookieOptions(),
  );

  return response;
}
