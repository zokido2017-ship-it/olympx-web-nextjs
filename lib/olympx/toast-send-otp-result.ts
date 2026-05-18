"use client";

import { toast } from "sonner";

import { extractOtpHintFromApiPayload } from "@/services/olympx-auth.service";

/** After `send-otp`, show OTP if the API echoes it (dev); otherwise a generic success. */
export function toastAfterSendOtp(
  sendRes: Record<string, unknown>,
  generic: { title: string; description: string },
): void {
  const hint = extractOtpHintFromApiPayload(sendRes);
  if (hint) {
    toast.message("Verification code", {
      description: `Your code: ${hint} (shown because the API included it in the response).`,
    });
    return;
  }
  toast.success(generic.title, { description: generic.description });
}
