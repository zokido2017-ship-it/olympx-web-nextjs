import {
  safeLocalGetItem,
  safeLocalRemoveItem,
  safeLocalSetItem,
} from "@/lib/safe-storage";

export const AUTH_SESSION_STORAGE_KEY = "sportxo_auth_session";
export const AUTH_TOKEN_STORAGE_KEY = "sportxo_auth_token";
export const PLAYER_PROFILE_COMPLETE_STORAGE_KEY =
  "sportxo_player_profile_complete";

export const PLAYER_PROFILE_PATH = "/player-profile";
export const DASHBOARD_PATH = "/dashboard";

function readFlag(key: string): boolean {
  return safeLocalGetItem(key) === "1";
}

export function getAuthToken(): string | null {
  const token = safeLocalGetItem(AUTH_TOKEN_STORAGE_KEY);
  return token?.trim() || null;
}

export function setAuthToken(token: string): void {
  safeLocalSetItem(AUTH_TOKEN_STORAGE_KEY, token);
  safeLocalSetItem(AUTH_SESSION_STORAGE_KEY, "1");
}

export function clearAuthToken(): void {
  safeLocalRemoveItem(AUTH_TOKEN_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken()) || readFlag(AUTH_SESSION_STORAGE_KEY);
}

export function markAuthenticated(): void {
  safeLocalSetItem(AUTH_SESSION_STORAGE_KEY, "1");
}

export function clearAuthenticated(): void {
  clearAuthToken();
  safeLocalRemoveItem(AUTH_SESSION_STORAGE_KEY);
}

export function isPlayerProfileComplete(): boolean {
  return readFlag(PLAYER_PROFILE_COMPLETE_STORAGE_KEY);
}

export function markPlayerProfileComplete(): void {
  safeLocalSetItem(PLAYER_PROFILE_COMPLETE_STORAGE_KEY, "1");
}

export function clearPlayerProfileComplete(): void {
  safeLocalRemoveItem(PLAYER_PROFILE_COMPLETE_STORAGE_KEY);
}

/** Where to send the user after real API auth (see `navigateAfterAuthSuccess`). */
export function getPostLoginPath(): string {
  return isPlayerProfileComplete() ? DASHBOARD_PATH : PLAYER_PROFILE_PATH;
}
