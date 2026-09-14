/** Default OTP for local development (only used when dev OTP is enabled). */
export const DEFAULT_OTP =
  process.env.NEXT_PUBLIC_DEFAULT_OTP?.trim() || "2468";

/** When true, OTP forms are pre-filled and the default OTP hint is shown. */
export function isDevOtpEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_ENABLE_DEV_OTP?.trim().toLowerCase();
  return flag === "true" || flag === "1";
}

/** @deprecated Dev bypass is disabled — OTP must be validated by the API. */
export function isDevOtpBypassEnabled(): boolean {
  return false;
}

export function isDevOtpCode(_otp: string): boolean {
  return false;
}

export function createDefaultOtpDigits(length = 4): string[] {
  if (!isDevOtpEnabled()) {
    return Array.from({ length }, () => "");
  }

  const digits = DEFAULT_OTP.replace(/\D/g, "").slice(0, length);
  if (digits.length !== length) {
    return Array.from({ length }, () => "");
  }
  return digits.split("");
}
