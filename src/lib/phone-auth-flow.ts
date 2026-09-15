import type { PhoneOtpFlags } from "@/lib/auth-otp-flags";

/** User-facing guidance after send-otp based on entry flow and API flags. */
export function getSendOtpGuidance(
  flow: "login" | "signup",
  flags: PhoneOtpFlags,
): { toast: "success" | "info"; message: string } {
  if (flags.registered && flags.playerExists) {
    return {
      toast: "info",
      message:
        flow === "signup"
          ? "This number is already registered. We'll sign you in after verification."
          : "OTP sent. We'll sign you in after verification.",
    };
  }

  if (flags.registered) {
    return {
      toast: "info",
      message:
        flow === "signup"
          ? "This number is registered. Complete verification to continue."
          : "OTP sent. Finish setting up your profile after verification.",
    };
  }

  return {
    toast: "success",
    message:
      flow === "login"
        ? "OTP sent. We'll help you create your account after verification."
        : "OTP sent. We'll create your account after verification.",
  };
}
