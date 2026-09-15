import { AuthEntryHeader } from "@/components/auth/auth-entry-header";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpVerificationForm } from "@/components/auth/otp-verification-form";

export function OtpVerificationScreen() {
  return (
    <AuthShell>
      <AuthFormCard>
        <AuthEntryHeader
          title="Verify your number"
          subtitle="Step 2 of 2 — confirm the code we sent to your phone."
        />
        <OtpVerificationForm />
      </AuthFormCard>
    </AuthShell>
  );
}
