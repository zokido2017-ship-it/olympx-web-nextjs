import { isOlympxDevSessionConfirmBypassed } from "@/lib/olympx/auth-bypass";
import { authDebug } from "@/lib/olympx/auth-debug";

import { recordAuthFlowStepWithStorage } from "@/lib/olympx/auth-flow-tracer";

import { trace, traceToken } from "@/lib/olympx/auth-flow-trace";

import { stageBridgeToken } from "@/lib/olympx/bridge-token-handoff";

import { DEFAULT_POST_LOGIN_PATH } from "@/lib/olympx/default-post-login";

import { ensureOlympxSessionCookieFromStorage } from "@/lib/olympx/session";

import { submitSessionCompleteForm } from "@/lib/olympx/submit-session-complete-form";
import { syncOlympxSessionToServer } from "@/lib/olympx/sync-server-session";


export const SESSION_BRIDGE_PATH = "/auth/session-bridge";



function sanitizeNextPath(nextPath: string): string {

  if (nextPath.startsWith("/") && !nextPath.startsWith("//")) {

    return nextPath;

  }

  return DEFAULT_POST_LOGIN_PATH;

}



/**

 * After OTP: persist token (localStorage + document.cookie) then form POST

 * `/api/auth/olympx-session/complete`.

 *

 * Auth is lost at proxy.ts (lines 96–99) when the HTTP cookie is missing on the

 * document request to /organizations/create. localStorage is invisible to proxy.

 * The complete route must return 200 + Set-Cookie (not 303) so the cookie commits.

 */

export async function establishSessionAndNavigateAsync(

  token: string,

  nextPath = DEFAULT_POST_LOGIN_PATH,

): Promise<boolean> {

  if (typeof window === "undefined") return false;

  const trimmed = token.trim();

  if (!trimmed) return false;



  const next = sanitizeNextPath(nextPath);

  stageBridgeToken(trimmed);

  ensureOlympxSessionCookieFromStorage();

  recordAuthFlowStepWithStorage("post-login.token.ready", { next });

  traceToken("session.establish.start", trimmed);

  // TODO: Restore proper auth — remove dev bypass; always use form POST session-complete flow below.
  if (isOlympxDevSessionConfirmBypassed()) {
    authDebug("post-login", "DEV BYPASS: sync cookie then direct navigate", {
      next,
    });
    recordAuthFlowStepWithStorage("post-login.dev_bypass.direct", { next });
    await syncOlympxSessionToServer(trimmed);
    ensureOlympxSessionCookieFromStorage();
    trace("session.complete.navigate", { next, via: "dev-bypass-direct" });
    window.location.replace(next);
    return true;
  }

  authDebug("post-login", "form POST /api/auth/olympx-session/complete → 200 Set-Cookie bridge", {
    next,
  });

  trace("session.complete.navigate", { next, via: "form-post-complete" });

  submitSessionCompleteForm(trimmed, next);

  return true;
}



/** @deprecated Prefer establishSessionAndNavigateAsync */

export function establishSessionAndNavigate(

  token: string,

  nextPath = DEFAULT_POST_LOGIN_PATH,

): void {

  void establishSessionAndNavigateAsync(token, nextPath);

}



export function navigateToPostLoginEstablishment(

  nextPath = DEFAULT_POST_LOGIN_PATH,

  token?: string | null,

): void {

  if (token?.trim()) {

    void establishSessionAndNavigateAsync(token, nextPath);

    return;

  }

  if (typeof window === "undefined") return;

  const next = sanitizeNextPath(nextPath);

  const url = new URL(SESSION_BRIDGE_PATH, window.location.origin);

  url.searchParams.set("next", next);

  trace("session.complete.navigate", { next, via: SESSION_BRIDGE_PATH });

  window.location.assign(url.toString());

}



export function completeOlympxSessionViaNavigation(

  nextPath = DEFAULT_POST_LOGIN_PATH,

  token?: string | null,

): void {

  navigateToPostLoginEstablishment(nextPath, token);

}


