import {
  safeLocalGetItem,
  safeLocalRemoveItem,
  safeLocalSetItem,
} from "@/lib/safe-storage";

export const AUTH_SESSION_STORAGE_KEY = "sportxo_auth_session";
export const AUTH_TOKEN_STORAGE_KEY = "sportxo_auth_token";
export const REGISTERED_USER_STORAGE_KEY = "sportxo_registered_user";
export const PLAYER_PROFILE_COMPLETE_STORAGE_KEY =
  "sportxo_player_profile_complete";
export const PLAYER_ID_STORAGE_KEY = "sportxo_player_id";

export type StoredRegisteredUser = {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  contact_email?: string | null;
  phone_code?: string | null;
  mobile_number?: string | null;
};

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

export function setRegisteredUser(user: StoredRegisteredUser): void {
  safeLocalSetItem(REGISTERED_USER_STORAGE_KEY, JSON.stringify(user));
}

export function getRegisteredUser(): StoredRegisteredUser | null {
  const raw = safeLocalGetItem(REGISTERED_USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredRegisteredUser;
    return typeof parsed.id === "number" ? parsed : null;
  } catch {
    return null;
  }
}

export function clearRegisteredUser(): void {
  safeLocalRemoveItem(REGISTERED_USER_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken()) || readFlag(AUTH_SESSION_STORAGE_KEY);
}

export function markAuthenticated(): void {
  safeLocalSetItem(AUTH_SESSION_STORAGE_KEY, "1");
}

export function clearAuthenticated(): void {
  clearAuthToken();
  clearRegisteredUser();
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

export function getStoredPlayerId(): number | null {
  const raw = safeLocalGetItem(PLAYER_ID_STORAGE_KEY);
  if (!raw) return null;

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function setStoredPlayerId(playerId: number): void {
  safeLocalSetItem(PLAYER_ID_STORAGE_KEY, String(playerId));
}

export function clearStoredPlayerId(): void {
  safeLocalRemoveItem(PLAYER_ID_STORAGE_KEY);
}

/** Where to send the user after real API auth (see `navigateAfterAuthSuccess`). */
export function getPostLoginPath(): string {
  return isPlayerProfileComplete() ? DASHBOARD_PATH : PLAYER_PROFILE_PATH;
}
