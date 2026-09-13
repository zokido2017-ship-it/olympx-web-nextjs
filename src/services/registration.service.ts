export {
  completePhoneOtpVerification,
  DuplicateMobileRegistrationError,
  type PhoneAuthResult,
} from "@/services/phone-auth.service";

import type { SignupSession } from "@/types/auth";
import { completePhoneOtpVerification } from "@/services/phone-auth.service";

/** @deprecated Use `completePhoneOtpVerification` with send-otp flags instead. */
export async function completePhoneRegistration(
  session: SignupSession,
  otp: string,
): Promise<void> {
  await completePhoneOtpVerification({
    otpPayload: {
      phone_code: session.phone_code,
      mobile_number: session.mobile_number,
      otp,
    },
    registered: Boolean(session.registered),
    playerExists: Boolean(session.player_exists),
    signupSession: session,
  });
}
