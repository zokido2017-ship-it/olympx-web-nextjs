import { getApiErrorMessage } from "@/lib/api/errors";
import { isDevOtpCode } from "@/lib/auth-otp";
import {
  markAuthenticated,
  setAuthToken,
  setRegisteredUser,
} from "@/lib/auth-session";
import { splitFullName } from "@/lib/phone";
import type { SignupSession } from "@/types/auth";
import {
  extractAuthToken,
  registerUser,
  validateOtp,
} from "@/services/auth-api.service";
import type { ValidateOtpRequest } from "@/types/api";

async function tryValidateOtpForToken(
  payload: ValidateOtpRequest,
): Promise<string | null> {
  try {
    const response = await validateOtp(payload);
    return extractAuthToken(response);
  } catch {
    return null;
  }
}

export async function completePhoneRegistration(
  session: SignupSession,
  otp: string,
): Promise<void> {
  const otpPayload: ValidateOtpRequest = {
    phone_code: session.phone_code,
    mobile_number: session.mobile_number,
    otp,
  };

  let token = await tryValidateOtpForToken(otpPayload);

  if (!token && !isDevOtpCode(otp)) {
    throw new Error("Invalid OTP. Please try again.");
  }

  const names = session.first_name
    ? {
        first_name: session.first_name,
        last_name: session.last_name || session.first_name,
      }
    : splitFullName(session.fullName || "Sportxo User");

  let registeredUserId: number | null = null;

  try {
    const registeredUser = await registerUser({
      phone_code: session.phone_code,
      mobile_number: session.mobile_number,
      first_name: names.first_name,
      last_name: names.last_name,
      display_name: session.fullName || names.first_name,
      contact_email: session.email,
    });

    registeredUserId = registeredUser.id;
    setRegisteredUser({
      id: registeredUser.id,
      first_name: registeredUser.first_name,
      last_name: registeredUser.last_name,
      full_name: registeredUser.full_name,
      display_name: registeredUser.display_name,
      contact_email: registeredUser.contact_email,
      phone_code: session.phone_code,
      mobile_number: session.mobile_number,
    });

    if (!token) {
      token = extractAuthToken(registeredUser as Record<string, unknown>);
    }
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

  if (!token) {
    token = await tryValidateOtpForToken(otpPayload);
  }

  if (token) {
    setAuthToken(token);
    return;
  }

  if (isDevOtpCode(otp) && registeredUserId) {
    markAuthenticated();
    return;
  }

  throw new Error(
    "Could not verify your phone number. Enter the OTP from your SMS and try again.",
  );
}
