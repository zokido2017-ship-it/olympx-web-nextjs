import { apiClient, apiRootClient } from "@/lib/api/client";
import {
  setAuthToken,
  setRegisteredUser,
  setStoredPlayerId,
} from "@/lib/auth-session";
import type {
  ApiUser,
  SendOtpRequest,
  SendOtpResponse,
  ValidateOtpRequest,
  ValidateOtpResponse,
} from "@/types/api";

export async function sendOtp(
  payload: SendOtpRequest,
): Promise<SendOtpResponse> {
  const { data } = await apiClient.post<SendOtpResponse>(
    "/auth/send-otp",
    payload,
  );
  return data;
}

export async function validateOtp(
  payload: ValidateOtpRequest,
): Promise<ValidateOtpResponse> {
  const { data } = await apiClient.post<ValidateOtpResponse>(
    "/auth/validate-otp",
    payload,
  );
  return data;
}

export async function fetchCurrentUser(): Promise<ApiUser> {
  const { data } = await apiRootClient.get<ApiUser>("/api/me");
  return data;
}

const TOKEN_FIELD_NAMES = [
  "token",
  "access_token",
  "auth_code",
  "auth_token",
  "auth_key",
  "plainTextToken",
] as const;

function readToken(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function extractTokenFromRecord(record: Record<string, unknown>): string | null {
  for (const field of TOKEN_FIELD_NAMES) {
    const token = readToken(record[field]);
    if (token) {
      return token;
    }
  }
  return null;
}

/** Extracts a Sanctum bearer token from common auth response shapes. */
export function extractAuthToken(
  response: ValidateOtpResponse | Record<string, unknown>,
): string | null {
  const record = response as Record<string, unknown>;
  const direct = extractTokenFromRecord(record);
  if (direct) {
    return direct;
  }

  for (const nestedKey of ["data", "result", "auth"]) {
    const nested = record[nestedKey];
    if (nested && typeof nested === "object") {
      const token = extractTokenFromRecord(nested as Record<string, unknown>);
      if (token) {
        return token;
      }
    }
  }

  return null;
}

function readExpiresAt(response: Record<string, unknown>): string | null {
  const direct = readToken(response.expires_at);
  if (direct) {
    return direct;
  }

  for (const nestedKey of ["data", "result", "auth"]) {
    const nested = response[nestedKey];
    if (nested && typeof nested === "object") {
      const expiresAt = readToken(
        (nested as Record<string, unknown>).expires_at,
      );
      if (expiresAt) {
        return expiresAt;
      }
    }
  }

  return null;
}

/** Stores bearer token + user/player metadata from an auth API response. */
export function persistAuthFromResponse(
  response: ValidateOtpResponse | Record<string, unknown>,
): string | null {
  const record = response as Record<string, unknown>;
  const token = extractAuthToken(record);
  if (!token) {
    return null;
  }

  setAuthToken(token, readExpiresAt(record) ?? undefined);

  const user = record.user;
  if (user && typeof user === "object" && typeof (user as ApiUser).id === "number") {
    setRegisteredUser(user as ApiUser);
    const playerId = (user as ApiUser).player?.id;
    if (typeof playerId === "number") {
      setStoredPlayerId(playerId);
    }
  }

  const player = record.player;
  if (player && typeof player === "object" && typeof (player as { id?: unknown }).id === "number") {
    setStoredPlayerId((player as { id: number }).id);
  }

  return token;
}

/** Loads `/api/me` when a bearer token is stored and syncs user + player id. */
export async function hydrateAuthenticatedSession(): Promise<ApiUser | null> {
  try {
    const user = await fetchCurrentUser();
    setRegisteredUser(user);
    if (user.player?.id) {
      setStoredPlayerId(user.player.id);
    }
    return user;
  } catch {
    return null;
  }
}
