import { markAuthenticated } from "@/lib/auth-session";
import { validateOtp } from "@/services/auth-api.service";
import type { ValidateOtpRequest, ValidateOtpResponse } from "@/types/api";

/** @deprecated Login now flows through `completePhoneOtpVerification`. */
export async function completePhoneLogin(
  payload: ValidateOtpRequest,
): Promise<ValidateOtpResponse> {
  const response = await validateOtp(payload);
  markAuthenticated();
  return response;
}
