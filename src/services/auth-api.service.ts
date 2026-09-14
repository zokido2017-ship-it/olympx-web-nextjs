import { apiClient, apiRootClient } from "@/lib/api/client";
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

function readToken(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Extracts a Sanctum bearer token from common auth response shapes. */
export function extractAuthToken(
  response: ValidateOtpResponse | Record<string, unknown>,
): string | null {
  const record = response as Record<string, unknown>;
  const direct = readToken(record.token) || readToken(record.access_token);
  if (direct) {
    return direct;
  }

  const data = record.data;
  if (data && typeof data === "object") {
    const nested = data as Record<string, unknown>;
    return readToken(nested.token) || readToken(nested.access_token);
  }

  return null;
}
