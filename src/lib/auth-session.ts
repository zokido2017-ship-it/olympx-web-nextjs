import { isPhoneVerified, clearVerifiedPhoneSession } from "@/lib/auth-verified-phone";
import {
  safeLocalGetItem,
  safeLocalRemoveItem,
  safeLocalSetItem,
} from "@/lib/safe-storage";

export const AUTH_SESSION_STORAGE_KEY = "sportxo_auth_session";
export const AUTH_TOKEN_STORAGE_KEY = "sportxo_auth_token";
export const AUTH_TOKEN_EXPIRES_AT_STORAGE_KEY = "sportxo_auth_token_expires_at";
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
  if (!token?.trim()) {
    return null;
  }

  const expiresAt = safeLocalGetItem(AUTH_TOKEN_EXPIRES_AT_STORAGE_KEY);
  if (expiresAt) {
    const expiryMs = Date.parse(expiresAt);
    if (Number.isFinite(expiryMs) && expiryMs <= Date.now()) {
      clearAuthToken();
      return null;
    }
  }

  return token.trim();
}

export function getAuthTokenExpiresAt(): string | null {
  const expiresAt = safeLocalGetItem(AUTH_TOKEN_EXPIRES_AT_STORAGE_KEY);
  return expiresAt?.trim() || null;
}

export function setAuthToken(token: string, expiresAt?: string): void {
  safeLocalSetItem(AUTH_TOKEN_STORAGE_KEY, token);
  safeLocalSetItem(AUTH_SESSION_STORAGE_KEY, "1");
  if (expiresAt?.trim()) {
    safeLocalSetItem(AUTH_TOKEN_EXPIRES_AT_STORAGE_KEY, expiresAt.trim());
  } else {
    safeLocalRemoveItem(AUTH_TOKEN_EXPIRES_AT_STORAGE_KEY);
  }
}

export function clearAuthToken(): void {
  safeLocalRemoveItem(AUTH_TOKEN_STORAGE_KEY);
  safeLocalRemoveItem(AUTH_TOKEN_EXPIRES_AT_STORAGE_KEY);
}

export function hasAuthToken(): boolean {
  return Boolean(getAuthToken());
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

/** True when a bearer token is stored (required for protected API routes). */
export function isAuthenticated(): boolean {
  return hasAuthToken();
}

/** True during OTP-verified registration before a bearer token may be issued. */
export function hasVerifiedPhoneAccess(): boolean {
  return isPhoneVerified();
}

/** Dashboard and authenticated API access require a bearer token. */
export function canAccessProtectedApis(): boolean {
  return hasAuthToken();
}

export function markAuthenticated(): void {
  safeLocalSetItem(AUTH_SESSION_STORAGE_KEY, "1");
}

export function clearAuthenticated(): void {
  clearAuthToken();
  clearRegisteredUser();
  clearVerifiedPhoneSession();
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
