import type { Metadata } from "next";
import { AuthEntryHeader } from "@/components/auth/auth-entry-header";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupOtpForm } from "@/components/auth/signup-otp-form";

export const metadata: Metadata = {
  title: "Verify phone",
  description: "Verify your phone number to complete Sportxo registration.",
};

export default function SignupVerifyPage() {
  return (
    <AuthShell>
      <AuthFormCard>
        <AuthEntryHeader
          title="Verify your number"
          subtitle="Step 2 of 2 — confirm the code we sent to your phone."
        />
        <SignupOtpForm />
      </AuthFormCard>
    </AuthShell>
  );
}
