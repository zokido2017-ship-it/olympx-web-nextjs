import { authDebug, authDebugMaskToken } from "@/lib/olympx/auth-debug";
import { recordAuthFlowStep } from "@/lib/olympx/auth-flow-tracer";
import { logAuthStorageSnapshot } from "@/lib/olympx/auth-storage-snapshot";
import {
  clearStagedBridgeToken,
  peekStagedBridgeToken,
} from "@/lib/olympx/bridge-token-handoff";
import { trace, traceToken } from "@/lib/olympx/auth-flow-trace";
import { submitSessionCompleteForm } from "@/lib/olympx/submit-session-complete-form";
import {
  ensureOlympxSessionCookieFromStorage,
  readOlympxAccessToken,
} from "@/lib/olympx/session";
import { OLYMPX_ACCESS_TOKEN_KEY } from "@/lib/olympx/session-constants";
import { ensureOlympxSessionReady } from "@/lib/olympx/ensure-session-ready";

export {
  acquireBridgeRunLock,
  releaseBridgeRunLock,
} from "@/lib/olympx/bridge-token-handoff";

const POLL_MS = 100;
const MAX_POLLS = 50;

function readClientCookiePresence(): { present: boolean; length: number } {
  if (typeof document === "undefined") return { present: false, length: 0 };
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${OLYMPX_ACCESS_TOKEN_KEY}=`)) continue;
    return {
      present: true,
      length: trimmed.length - OLYMPX_ACCESS_TOKEN_KEY.length - 1,
    };
  }
  return { present: false, length: 0 };
}

export type EstablishSessionResult =
  | { ok: true; attempts: number; method: "fetch" | "form" }
  | { ok: false; reason: string; attempts: number };

function resolveBridgeToken(explicit?: string | null): string {
  if (explicit?.trim()) return explicit.trim();
  const staged = peekStagedBridgeToken();
  if (staged) return staged;
  ensureOlympxSessionCookieFromStorage();
  return readOlympxAccessToken()?.trim() ?? "";
}

export async function establishServerSessionWithProof(
  explicitToken?: string | null,
  destination = "/organizations/create",
): Promise<EstablishSessionResult> {
  logAuthStorageSnapshot("establish-session:start");
  const token = resolveBridgeToken(explicitToken);
  if (!token) {
    trace("session.establish.fail", { reason: "no_token_in_storage" });
    authDebug("establish-session", "FAIL: no token in staged/storage/cookie", {});
    return { ok: false, reason: "no_token_in_storage", attempts: 0 };
  }

  traceToken("session.establish.start", token);
  authDebug("establish-session", "resolved token", {
    token: authDebugMaskToken(token),
    clientCookie: readClientCookiePresence(),
  });

  const ready = await ensureOlympxSessionReady({
    explicitToken: token,
    maxPolls: MAX_POLLS,
    pollMs: POLL_MS,
  });
  recordAuthFlowStep("establish-session.ready", {
    ok: ready.ok,
    serverConfirmed: ready.serverConfirmed,
  });
  authDebug("establish-session", "ensureOlympxSessionReady", {
    ok: ready.ok,
    serverConfirmed: ready.serverConfirmed,
  });

  if (ready.serverConfirmed) {
    clearStagedBridgeToken();
    trace("session.establish.ok", { method: "fetch" });
    return { ok: true, attempts: MAX_POLLS, method: "fetch" };
  }

  authDebug("establish-session", "server cookie not confirmed — form POST /complete fallback", {
    destination,
  });
  clearStagedBridgeToken();
  submitSessionCompleteForm(token, destination);
  return { ok: true, attempts: 0, method: "form" };
}
