import {
  DUPLICATE_MOBILE_MESSAGE,
  getApiErrorMessage,
  isDuplicateMobileError,
} from "@/lib/api/errors";
import {
  setVerifiedPhoneSession,
  type VerifiedPhoneSession,
} from "@/lib/auth-verified-phone";
import { markAuthenticated } from "@/lib/auth-session";
import type { SignupSession } from "@/types/auth";
import {
  hydrateAuthenticatedSession,
  persistAuthFromResponse,
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

function buildVerifiedPhoneSession(
  otpPayload: ValidateOtpRequest,
  signupSession?: SignupSession | null,
  flags?: { registered?: boolean; player_exists?: boolean },
): VerifiedPhoneSession {
  const countryCode =
    signupSession?.countryCode ??
    (otpPayload.phone_code.startsWith("+")
      ? otpPayload.phone_code
      : `+${otpPayload.phone_code}`);
  const phoneNumber =
    signupSession?.phoneNumber ?? otpPayload.mobile_number;

  return {
    phone_code: otpPayload.phone_code,
    mobile_number: otpPayload.mobile_number,
    countryCode,
    phoneNumber,
    registered: Boolean(flags?.registered),
    player_exists: Boolean(flags?.player_exists),
  };
}

/** Verifies OTP via `POST /auth/validate-otp` only — player register happens later in the wizard. */
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

  const resolvedRegistered = Boolean(
    otpResponse.registered ?? registered,
  );
  const resolvedPlayerExists = Boolean(
    otpResponse.player_exists ?? playerExists,
  );

  if (
    !resolvedRegistered &&
    signupSession?.registered &&
    resolvedPlayerExists
  ) {
    throw new DuplicateMobileRegistrationError();
  }

  const authToken = persistAuthFromResponse(otpResponse);
  if (authToken) {
    await hydrateAuthenticatedSession();
  }

  setVerifiedPhoneSession(
    buildVerifiedPhoneSession(otpPayload, signupSession, {
      registered: resolvedRegistered,
      player_exists: resolvedPlayerExists,
    }),
  );
  markAuthenticated();

  if (resolvedRegistered && resolvedPlayerExists) {
    return {
      mode: "login",
      playerExists: true,
    };
  }

  return {
    mode: "register",
    playerExists: resolvedPlayerExists,
  };
}
