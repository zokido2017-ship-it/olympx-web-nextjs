import type { Metadata } from "next";
import { AuthEntryHeader } from "@/components/auth/auth-entry-header";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupPhoneForm } from "@/components/auth/signup-phone-form";

export const metadata: Metadata = {
  title: "Add phone number",
  description: "Add your phone number after Google sign-in to complete registration.",
};

export default function SignupPhonePage() {
  return (
    <AuthShell>
      <AuthFormCard>
        <AuthEntryHeader
          title="Add your phone"
          subtitle="We received your Google account. Add a mobile number to finish registration."
        />
        <SignupPhoneForm />
      </AuthFormCard>
    </AuthShell>
  );
}
