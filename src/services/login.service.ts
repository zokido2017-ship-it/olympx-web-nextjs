import { markAuthenticated } from "@/lib/auth-session";
import {
  hydrateAuthenticatedSession,
  persistAuthFromResponse,
  validateOtp,
} from "@/services/auth-api.service";
import type { ValidateOtpRequest, ValidateOtpResponse } from "@/types/api";

/** @deprecated Login now flows through `completePhoneOtpVerification`. */
export async function completePhoneLogin(
  payload: ValidateOtpRequest,
): Promise<ValidateOtpResponse> {
  const response = await validateOtp(payload);
  if (persistAuthFromResponse(response)) {
    await hydrateAuthenticatedSession();
  }
  markAuthenticated();
  return response;
}
