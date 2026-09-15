/** Pre-filled OTP for QA — always validated through `POST /auth/validate-otp`. */
export const DEFAULT_OTP =
  process.env.NEXT_PUBLIC_DEFAULT_OTP?.trim() || "0000";

/** @deprecated Dev bypass is disabled — OTP must be validated by the API. */
export function isDevOtpBypassEnabled(): boolean {
  return false;
}

export function isDevOtpCode(_otp: string): boolean {
  return false;
}

/** @deprecated Use `showDefaultOtpHint()` — pre-fill is always on when DEFAULT_OTP is set. */
export function isDevOtpEnabled(): boolean {
  return showDefaultOtpHint();
}

export function showDefaultOtpHint(): boolean {
  return DEFAULT_OTP.replace(/\D/g, "").length >= 4;
}

export function createDefaultOtpDigits(length = 4): string[] {
  const digits = DEFAULT_OTP.replace(/\D/g, "").slice(0, length);
  if (digits.length !== length) {
    return Array.from({ length }, () => "");
  }
  return digits.split("");
}
