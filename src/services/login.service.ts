import { setAuthToken, setRegisteredUser } from "@/lib/auth-session";
import {
  extractAuthToken,
  validateOtp,
} from "@/services/auth-api.service";
import type { ValidateOtpRequest, ValidateOtpResponse } from "@/types/api";

export async function completePhoneLogin(
  payload: ValidateOtpRequest,
): Promise<ValidateOtpResponse> {
  const response = await validateOtp(payload);
  const token = extractAuthToken(response);

  if (!token) {
    throw new Error("Could not sign in. Please try again.");
  }

  setAuthToken(token);

  if (response.user?.id) {
    setRegisteredUser({
      id: response.user.id,
      first_name: response.user.first_name,
      last_name: response.user.last_name,
      full_name: response.user.full_name,
      display_name: response.user.display_name,
      contact_email: response.user.contact_email,
      phone_code: payload.phone_code,
      mobile_number: payload.mobile_number,
    });
  }

  return response;
}
