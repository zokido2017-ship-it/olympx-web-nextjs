import { authDebug, authDebugMaskToken } from "@/lib/olympx/auth-debug";
import { BRIDGE_TOKEN_KEY } from "@/lib/olympx/bridge-token-handoff";
import { OLYMPX_ACCESS_TOKEN_KEY, OLYMPX_AUTH_JSON_KEY } from "@/lib/olympx/session-constants";
import {
  safeLocalStorageGet,
  safeSessionStorageGet,
} from "@/lib/safe-web-storage";

/** Dev trace: where the bearer token lives after OTP (console [auth-flow:storage]). */
export function logAuthStorageSnapshot(label: string): void {
  if (typeof window === "undefined") return;
  try {
    const lsToken = safeLocalStorageGet(OLYMPX_ACCESS_TOKEN_KEY);
    const ssToken = safeSessionStorageGet(OLYMPX_ACCESS_TOKEN_KEY);
    const staged = safeSessionStorageGet(BRIDGE_TOKEN_KEY);
    let cookieRow: string | undefined;
    try {
      cookieRow = document.cookie
        .split(";")
        .map((p) => p.trim())
        .find((r) => r.startsWith(`${OLYMPX_ACCESS_TOKEN_KEY}=`));
    } catch {
      cookieRow = undefined;
    }
    authDebug("storage", label, {
      origin: window.location.origin,
      localStorageToken: lsToken ? authDebugMaskToken(lsToken) : null,
      sessionStorageToken: ssToken ? authDebugMaskToken(ssToken) : null,
      stagedBridgeToken: staged ? authDebugMaskToken(staged) : null,
      hasAuthJson: Boolean(
        safeLocalStorageGet(OLYMPX_AUTH_JSON_KEY) ??
          safeSessionStorageGet(OLYMPX_AUTH_JSON_KEY),
      ),
      cookiePresent: Boolean(cookieRow),
      cookieLength: cookieRow
        ? cookieRow.length - OLYMPX_ACCESS_TOKEN_KEY.length - 1
        : 0,
    });
  } catch {
    /* storage or cookie access denied on this document */
  }
}
