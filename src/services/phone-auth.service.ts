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

export type PhoneAuthResult = {
  mode: "login" | "register";
  playerExists: boolean;
};

function buildSignupSessionFromOtp(
  payload: ValidateOtpRequest,
  session?: SignupSession | null,
): SignupSession {
  if (session) {
    return session;
  }

  return {
    mode: "phone",
    countryCode: `+${payload.phone_code}`,
    phoneNumber: payload.mobile_number,
    phone_code: payload.phone_code,
    mobile_number: payload.mobile_number,
  };
}

export async function completePhoneOtpVerification({
  otpPayload,
  registered,
  playerExists,
  signupSession,
}: {
  otpPayload: ValidateOtpRequest;
  registered: boolean;
  playerExists: boolean;
  signupSession?: SignupSession | null;
}): Promise<PhoneAuthResult> {
  let otpResponse;
  try {
    otpResponse = await validateOtp(otpPayload);
  } catch (error) {
    if (isDuplicateMobileError(error)) {
      throw new DuplicateMobileRegistrationError();
    }
    throw new Error(getApiErrorMessage(error, "Invalid OTP. Please try again."));
  }

  const token = extractAuthToken(otpResponse);
  if (!token) {
    throw new Error(
      "Could not verify your phone number. Enter the OTP from your SMS and try again.",
    );
  }

  if (registered) {
    setAuthToken(token);

    if (otpResponse.user?.id) {
      setRegisteredUser({
        id: otpResponse.user.id,
        first_name: otpResponse.user.first_name,
        last_name: otpResponse.user.last_name,
        full_name: otpResponse.user.full_name,
        display_name: otpResponse.user.display_name,
        contact_email: otpResponse.user.contact_email,
        phone_code: otpPayload.phone_code,
        mobile_number: otpPayload.mobile_number,
      });
    }

    const resolvedPlayerExists =
      playerExists || Boolean(otpResponse.user?.player?.id);

    return {
      mode: "login",
      playerExists: resolvedPlayerExists,
    };
  }

  if (otpResponse.user?.id) {
    throw new DuplicateMobileRegistrationError();
  }

  const session = buildSignupSessionFromOtp(otpPayload, signupSession);
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
  } catch (error) {
    if (isDuplicateMobileError(error)) {
      throw new DuplicateMobileRegistrationError();
    }
    throw error;
  }

  setAuthToken(token);

  return {
    mode: "register",
    playerExists: false,
  };
}
