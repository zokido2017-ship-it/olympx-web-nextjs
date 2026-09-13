import { completePhoneLogin } from "@/services/login.service";
import type { ValidateOtpRequest, ValidateOtpResponse } from "@/types/api";

/** Validates OTP against the API and establishes an authenticated session. */
export async function verifyOtpWithDevBypass(
  payload: ValidateOtpRequest,
): Promise<ValidateOtpResponse> {
  return completePhoneLogin(payload);
}
