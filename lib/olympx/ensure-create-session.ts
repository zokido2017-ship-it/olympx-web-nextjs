import {
  ensureOlympxSessionCookieFromStorage,
  readOlympxAccessToken,
  resolveClientOlympxAccessToken,
} from "@/lib/olympx/session";
import {
  checkOlympxServerSession,
  syncOlympxSessionToServer,
} from "@/lib/olympx/sync-server-session";

export type CreateSessionState = {
  token: string | null;
  /** True when a bearer token or middleware session cookie is available. */
  canCreate: boolean;
};

/**
 * Align client storage, document cookie, and Next session route before mutations.
 */
export async function ensureCreateSession(
  explicitToken?: string | null,
): Promise<CreateSessionState> {
  ensureOlympxSessionCookieFromStorage();

  let token = resolveClientOlympxAccessToken(explicitToken);
  if (token) {
    await syncOlympxSessionToServer(token);
    return { token, canCreate: true };
  }

  const serverOk = await checkOlympxServerSession();
  if (serverOk) {
    token = readOlympxAccessToken();
    if (token) {
      await syncOlympxSessionToServer(token);
      return { token, canCreate: true };
    }
    // Cookie exists server-side (middleware) but is not readable in JS — still allow BFF via credentials.
    return { token: null, canCreate: true };
  }

  return { token: null, canCreate: false };
}
