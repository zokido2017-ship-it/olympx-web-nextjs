/** Session keys for Firebase phone OTP → `/verify-otp` handoff */
export const PHONE_VERIFICATION_ID_KEY = "phone_verification_id";
export const PHONE_E164_KEY = "phone_e164";

/** OTP input length on `/verify-otp`. Firebase SMS commonly sends 6 digits—set to `6` if sign-in rejects the code. */
export const PHONE_OTP_DIGIT_COUNT = 4 as const;
