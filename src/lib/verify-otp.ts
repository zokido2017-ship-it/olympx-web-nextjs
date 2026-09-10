import { isDevOtpCode } from "@/lib/auth-otp";
import { markAuthenticated, setAuthToken } from "@/lib/auth-session";
import {
  extractAuthToken,
  validateOtp,
} from "@/services/auth-api.service";
import type { ValidateOtpRequest, ValidateOtpResponse } from "@/types/api";

/** Validates OTP against the API, with optional dev bypass for the default code. */
export async function verifyOtpWithDevBypass(
  payload: ValidateOtpRequest,
): Promise<ValidateOtpResponse | null> {
  try {
    const response = await validateOtp(payload);
    const token = extractAuthToken(response);
    if (token) {
      setAuthToken(token);
    } else {
      markAuthenticated();
    }
    return response;
  } catch (error) {
    if (!isDevOtpCode(payload.otp)) {
      throw error;
    }
    markAuthenticated();
    return null;
  }
}
