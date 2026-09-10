/** Default OTP for development and QA (pre-filled in forms). */
export const DEFAULT_OTP =
  process.env.NEXT_PUBLIC_DEFAULT_OTP?.trim() || "0000";

/** When true, `DEFAULT_OTP` can complete auth if the API rejects it. */
export function isDevOtpBypassEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_ENABLE_DEV_OTP?.trim().toLowerCase();
  if (flag === "false" || flag === "0") {
    return false;
  }
  return true;
}

export function isDevOtpCode(otp: string): boolean {
  return isDevOtpBypassEnabled() && otp.trim() === DEFAULT_OTP;
}

export function createDefaultOtpDigits(length = 4): string[] {
  const digits = DEFAULT_OTP.replace(/\D/g, "").slice(0, length);
  if (digits.length !== length) {
    return Array.from({ length }, () => "");
  }
  return digits.split("");
}
