import { AuthEntryHeader } from "@/components/auth/auth-entry-header";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export function SignupScreen() {
  return (
    <AuthShell>
      <AuthFormCard>
        <AuthEntryHeader
          subtitle="One account for every sport. Set up your profile, then create teams or organisations when you're ready."
        />
        <SignupForm />
      </AuthFormCard>
    </AuthShell>
  );
}
