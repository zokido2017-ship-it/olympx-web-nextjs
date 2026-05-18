import { extractAuthTokenFromApiBody } from "@/lib/olympx/extract-token";
import { authDebug, authDebugMaskToken } from "@/lib/olympx/auth-debug";
import {
  OLYMPX_ACCESS_TOKEN_KEY,
  OLYMPX_SESSION_CHANGED,
} from "@/lib/olympx/session-constants";
import { clearOlympxSessionOnServer } from "@/lib/olympx/sync-server-session";
import {
  safeLocalStorageGet,
  safeLocalStorageRemove,
  safeLocalStorageSet,
  safeSessionStorageGet,
  safeSessionStorageRemove,
  safeSessionStorageSet,
} from "@/lib/safe-web-storage";

export const OLYMPX_AUTH_JSON_KEY = "olympx_auth";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 60; // 60 days

/** When all Web Storage APIs throw (sandboxed iframe), keep session for this tab only. */
let memoryAccessToken: string | null = null;
let memoryAuthJson: string | null = null;

function readCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  try {
    const row = document.cookie
      .split("; ")
      .find((r) => r.startsWith(`${name}=`));
    if (!row) return null;
    try {
      return decodeURIComponent(row.slice(name.length + 1));
    } catch {
      return row.slice(name.length + 1);
    }
  } catch {
    return null;
  }
}

function writeSessionCookie(token: string): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${OLYMPX_ACCESS_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${OLYMPX_ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

/**
 * Resolves bearer token from the JSON body (Axios: `response.data` = body, token at `response.data.token`).
 * Prefer nested `data.token` first, then root keys, then deep extract.
 */
export function resolveOlympxTokenFromApiPayload(
  raw: Record<string, unknown>,
): string | null {
  const data = raw.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    if (typeof d.token === "string" && d.token.trim()) return d.token.trim();
    if (typeof d.access_token === "string" && d.access_token.trim()) {
      return d.access_token.trim();
    }
  }

  if (typeof raw.token === "string" && raw.token.trim()) return raw.token.trim();
  if (typeof raw.access_token === "string" && raw.access_token.trim()) {
    return raw.access_token.trim();
  }

  return extractAuthTokenFromApiBody(raw);
}

export type OlympxAuthResponse = {
  token?: string;
  access_token?: string;
  user?: Record<string, unknown>;
  [key: string]: unknown;
};

export function ensureOlympxSessionCookieFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const token = readAccessTokenFromWebStorage();
    if (!token) return;
    const fromCookie = readCookieValue(OLYMPX_ACCESS_TOKEN_KEY);
    if (fromCookie === token) return;
    writeSessionCookie(token);
  } catch {
    /* storage / cookie blocked */
  }
}

export function notifyOlympxSessionChanged(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event(OLYMPX_SESSION_CHANGED));
  } catch {
    /* ignore */
  }
}

export function subscribeOlympxSession(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  try {
    window.addEventListener(OLYMPX_SESSION_CHANGED, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(OLYMPX_SESSION_CHANGED, handler);
      window.removeEventListener("storage", handler);
    };
  } catch {
    return () => {};
  }
}

/** Never use `[localStorage, sessionStorage]` — accessing those getters can throw (sandbox). */
function readAccessTokenFromWebStorage(): string | null {
  const fromLs = safeLocalStorageGet(OLYMPX_ACCESS_TOKEN_KEY);
  if (fromLs?.trim()) return fromLs.trim();
  const fromSs = safeSessionStorageGet(OLYMPX_ACCESS_TOKEN_KEY);
  if (fromSs?.trim()) return fromSs.trim();
  return null;
}

/** Bearer string from an auth response (always available after successful `olyMpxLoginWithOtp`). */
export function getOlympxTokenFromAuth(auth: OlympxAuthResponse): string | null {
  if (typeof auth.token === "string" && auth.token.trim()) {
    return auth.token.trim();
  }
  return resolveOlympxTokenFromApiPayload(auth as unknown as Record<string, unknown>);
}

export function readOlympxAuthJsonFromStorage(): OlympxAuthResponse | null {
  for (const raw of [
    safeLocalStorageGet(OLYMPX_AUTH_JSON_KEY),
    safeSessionStorageGet(OLYMPX_AUTH_JSON_KEY),
  ]) {
    if (!raw) continue;
    try {
      return JSON.parse(raw) as OlympxAuthResponse;
    } catch {
      /* try next */
    }
  }
  if (memoryAuthJson) {
    try {
      return JSON.parse(memoryAuthJson) as OlympxAuthResponse;
    } catch {
      return null;
    }
  }
  return null;
}

/** Used by session checks after mount. */
export function readOlympxAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromStorage = readAccessTokenFromWebStorage();
  if (fromStorage) return fromStorage;
  if (memoryAccessToken?.trim()) return memoryAccessToken.trim();
  const fromCookie = readCookieValue(OLYMPX_ACCESS_TOKEN_KEY);
  if (fromCookie?.trim()) return fromCookie.trim();
  return null;
}

function writeTokenPairToWebStorage(token: string, json: string): {
  tokenStore: "localStorage" | "sessionStorage" | null;
  jsonStore: "localStorage" | "sessionStorage" | null;
} {
  let tokenStore: "localStorage" | "sessionStorage" | null = null;
  let jsonStore: "localStorage" | "sessionStorage" | null = null;

  if (safeLocalStorageSet(OLYMPX_ACCESS_TOKEN_KEY, token)) {
    tokenStore = "localStorage";
  } else if (safeSessionStorageSet(OLYMPX_ACCESS_TOKEN_KEY, token)) {
    tokenStore = "sessionStorage";
  }

  if (safeLocalStorageSet(OLYMPX_AUTH_JSON_KEY, json)) {
    jsonStore = "localStorage";
  } else if (safeSessionStorageSet(OLYMPX_AUTH_JSON_KEY, json)) {
    jsonStore = "sessionStorage";
  }

  return { tokenStore, jsonStore };
}

/** Persist token for `RequireOlympxAuth`, middleware cookie, and optional API calls. */
export function persistOlympxAuthResponse(auth: OlympxAuthResponse): void {
  if (typeof window === "undefined") return;
  const token = getOlympxTokenFromAuth(auth);
  if (!token) return;
  try {
    const merged: OlympxAuthResponse = {
      ...auth,
      token,
    };
    const json = JSON.stringify(merged);
    const { tokenStore, jsonStore } = writeTokenPairToWebStorage(token, json);

    if (!tokenStore || !jsonStore) {
      memoryAccessToken = token;
      memoryAuthJson = json;
      authDebug("token-save", "using in-memory session fallback (web storage blocked?)", {
        token: authDebugMaskToken(token),
      });
    } else {
      memoryAccessToken = null;
      memoryAuthJson = null;
    }

    writeSessionCookie(token);
    authDebug("token-save", "web storage + cookie mirror written", {
      token: authDebugMaskToken(token),
      tokenStore,
      jsonStore,
    });
    notifyOlympxSessionChanged();
    authDebug("auth-state", "notified subscribers (Olympx session changed)");
  } catch (e) {
    authDebug("token-save", "persist failed after storage write", {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

export function clearOlympxSession(): void {
  if (typeof window === "undefined") return;
  memoryAccessToken = null;
  memoryAuthJson = null;
  try {
    safeLocalStorageRemove(OLYMPX_ACCESS_TOKEN_KEY);
    safeLocalStorageRemove(OLYMPX_AUTH_JSON_KEY);
    safeSessionStorageRemove(OLYMPX_ACCESS_TOKEN_KEY);
    safeSessionStorageRemove(OLYMPX_AUTH_JSON_KEY);
    clearSessionCookie();
    notifyOlympxSessionChanged();
    void clearOlympxSessionOnServer();
    authDebug("auth-state", "session cleared (client + server clear scheduled)");
  } catch {
    /* ignore */
  }
}
