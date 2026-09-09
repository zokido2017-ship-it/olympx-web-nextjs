import { getApiErrorMessage } from "@/lib/api/errors";
import { isDevOtpCode } from "@/lib/auth-otp";
import { markAuthenticated, setAuthToken } from "@/lib/auth-session";
import { splitFullName } from "@/lib/phone";
import type { SignupSession } from "@/types/auth";
import {
  extractAuthToken,
  registerUser,
  validateOtp,
} from "@/services/auth-api.service";
import type { ValidateOtpRequest } from "@/types/api";

export async function completePhoneRegistration(
  session: SignupSession,
  otp: string,
): Promise<void> {
  const otpPayload: ValidateOtpRequest = {
    phone_code: session.phone_code,
    mobile_number: session.mobile_number,
    otp,
  };

  let token: string | null = null;

  if (!isDevOtpCode(otp)) {
    const response = await validateOtp(otpPayload);
    token = extractAuthToken(response);
  } else {
    try {
      const response = await validateOtp(otpPayload);
      token = extractAuthToken(response);
    } catch {
      // Fall through to register + dev session when backend rejects 0000.
    }
  }

  const names = session.first_name
    ? {
        first_name: session.first_name,
        last_name: session.last_name || session.first_name,
      }
    : splitFullName(session.fullName || "Sportxo User");

  try {
    await registerUser({
      phone_code: session.phone_code,
      mobile_number: session.mobile_number,
      first_name: names.first_name,
      last_name: names.last_name,
      display_name: session.fullName || names.first_name,
      contact_email: session.email,
    });
  } catch (error) {
    const message = getApiErrorMessage(error, "");
    const duplicate =
      message.toLowerCase().includes("already") ||
      message.toLowerCase().includes("exists") ||
      message.toLowerCase().includes("taken");
    if (!duplicate) {
      throw error;
    }
  }

  if (token) {
    setAuthToken(token);
    return;
  }

  if (isDevOtpCode(otp)) {
    try {
      const response = await validateOtp(otpPayload);
      const retryToken = extractAuthToken(response);
      if (retryToken) {
        setAuthToken(retryToken);
        return;
      }
    } catch {
      /* register succeeded; continue with local session */
    }
  }

  markAuthenticated();
}
