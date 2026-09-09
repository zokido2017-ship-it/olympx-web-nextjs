import { apiClient, apiRootClient } from "@/lib/api/client";
import type {
  ApiUser,
  RegisterRequest,
  RegisterResponse,
  SendOtpRequest,
  ValidateOtpRequest,
  ValidateOtpResponse,
} from "@/types/api";

export async function sendOtp(payload: SendOtpRequest): Promise<void> {
  await apiClient.post("/auth/send-otp", payload);
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

export async function registerUser(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>(
    "/auth/register",
    payload,
  );
  return data;
}

export async function fetchCurrentUser(): Promise<ApiUser> {
  const { data } = await apiRootClient.get<ApiUser>("/api/me");
  return data;
}

/** Extracts a Sanctum bearer token from common auth response shapes. */
export function extractAuthToken(
  response: ValidateOtpResponse | Record<string, unknown>,
): string | null {
  const token =
    (typeof response.token === "string" && response.token) ||
    (typeof response.access_token === "string" && response.access_token) ||
    null;

  return token?.trim() || null;
}
