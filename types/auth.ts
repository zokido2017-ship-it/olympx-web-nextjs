/** Olympx OTP handoff (localStorage via `pending-otp.ts`) */
export const PHONE_E164_KEY = "olympx_phone_e164";

/** Firebase phone OTP (separate keys so it never clashes with Olympx storage) */
export const PHONE_VERIFICATION_ID_KEY = "firebase_phone_verification_id";
export const FIREBASE_PHONE_E164_KEY = "firebase_phone_e164";

/** OTP input length on `/login` (code step). Set to `6` if your API expects 6 digits. */
export const PHONE_OTP_DIGIT_COUNT = 4 as const;
