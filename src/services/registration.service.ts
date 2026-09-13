import {
  DUPLICATE_MOBILE_MESSAGE,
  getApiErrorMessage,
  isDuplicateMobileError,
} from "@/lib/api/errors";
import { setAuthToken, setRegisteredUser } from "@/lib/auth-session";
import { splitFullName } from "@/lib/phone";
import type { SignupSession } from "@/types/auth";
import {
  extractAuthToken,
  registerUser,
  validateOtp,
} from "@/services/auth-api.service";
import type { ValidateOtpRequest } from "@/types/api";

export class DuplicateMobileRegistrationError extends Error {
  constructor(message = DUPLICATE_MOBILE_MESSAGE) {
    super(message);
    this.name = "DuplicateMobileRegistrationError";
  }
}

function assertSignupOtpIsForNewUser(response: {
  user?: { id?: number | null } | null;
}): void {
  if (response.user?.id) {
    throw new DuplicateMobileRegistrationError();
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

  let otpResponse;
  try {
    otpResponse = await validateOtp(otpPayload);
  } catch (error) {
    if (isDuplicateMobileError(error)) {
      throw new DuplicateMobileRegistrationError();
    }
    throw new Error(getApiErrorMessage(error, "Invalid OTP. Please try again."));
  }

  assertSignupOtpIsForNewUser(otpResponse);

  let token = extractAuthToken(otpResponse);
  if (!token) {
    throw new Error(
      "Could not verify your phone number. Enter the OTP from your SMS and try again.",
    );
  }

  const names = session.first_name
    ? {
        first_name: session.first_name,
        last_name: session.last_name || session.first_name,
      }
    : splitFullName(session.fullName || "Sportxo User");

  try {
    const registeredUser = await registerUser({
      phone_code: session.phone_code,
      mobile_number: session.mobile_number,
      first_name: names.first_name,
      last_name: names.last_name,
      display_name: session.fullName || names.first_name,
      contact_email: session.email,
    });

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
    if (isDuplicateMobileError(error)) {
      throw new DuplicateMobileRegistrationError();
    }
    throw error;
  }

  if (!token) {
    throw new Error(
      "Account created but sign-in failed. Please log in with your phone number.",
    );
  }

  setAuthToken(token);
}
