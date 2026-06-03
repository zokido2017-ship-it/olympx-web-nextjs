import { authDebug } from "@/lib/olympx/auth-debug";
import { recordAuthFlowStep } from "@/lib/olympx/auth-flow-tracer";
import {
  ensureOlympxSessionCookieFromStorage,
  readOlympxAccessToken,
  resolveClientOlympxAccessToken,
} from "@/lib/olympx/session";
import {
  checkOlympxServerSession,
  syncOlympxSessionToServer,
} from "@/lib/olympx/sync-server-session";

const DEFAULT_POLL_MS = 100;
const DEFAULT_MAX_POLLS = 30;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export type SessionReadyResult = {
  ok: boolean;
  token: string | null;
  /** True when GET /api/auth/olympx-session confirms the middleware cookie jar. */
  serverConfirmed: boolean;
};

/**
 * Align localStorage, document.cookie, and the Next.js session route cookie
 * (same source middleware reads). Call before navigating to protected routes.
 */
export async function ensureOlympxSessionReady(options?: {
  explicitToken?: string | null;
  maxPolls?: number;
  pollMs?: number;
}): Promise<SessionReadyResult> {
  if (typeof window === "undefined") {
    return { ok: false, token: null, serverConfirmed: false };
  }

  const maxPolls = options?.maxPolls ?? DEFAULT_MAX_POLLS;
  const pollMs = options?.pollMs ?? DEFAULT_POLL_MS;

  ensureOlympxSessionCookieFromStorage();
  const token = resolveClientOlympxAccessToken(options?.explicitToken);

  if (token) {
    recordAuthFlowStep("ensure-session.sync.start", {
      hasExplicitToken: Boolean(options?.explicitToken),
    });
    const synced = await syncOlympxSessionToServer(token);
    recordAuthFlowStep("ensure-session.sync.done", { synced });
    ensureOlympxSessionCookieFromStorage();
  }

  for (let attempt = 1; attempt <= maxPolls; attempt += 1) {
    const serverOk = await checkOlympxServerSession();
    authDebug("ensure-session", "poll GET session", {
      attempt,
      serverOk,
      hasToken: Boolean(token ?? readOlympxAccessToken()),
    });
    if (serverOk) {
      recordAuthFlowStep("ensure-session.server.confirmed", { attempt });
      return {
        ok: true,
        token: readOlympxAccessToken() ?? token,
        serverConfirmed: true,
      };
    }
    ensureOlympxSessionCookieFromStorage();
    await sleep(pollMs);
  }

  const clientToken = readOlympxAccessToken();
  if (clientToken) {
    ensureOlympxSessionCookieFromStorage();
    authDebug("ensure-session", "client token present but GET poll missed", {
      hasClientToken: true,
    });
    recordAuthFlowStep("ensure-session.server.missed", {
      hasClientToken: true,
      maxPolls,
    });
    return { ok: false, token: clientToken, serverConfirmed: false };
  }

  recordAuthFlowStep("ensure-session.no_token", {});
  return { ok: false, token: null, serverConfirmed: false };
}

/** Guard recovery: sync + poll; only true when proxy-readable cookie is confirmed. */
export async function recoverOlympxClientSession(): Promise<boolean> {
  const result = await ensureOlympxSessionReady({ maxPolls: 50, pollMs: 100 });
  recordAuthFlowStep("recover.session", {
    serverConfirmed: result.serverConfirmed,
    hasToken: Boolean(result.token),
  });
  return result.serverConfirmed;
}
