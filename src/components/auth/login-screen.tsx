import { AuthEntryHeader } from "@/components/auth/auth-entry-header";
import { AuthFormCard } from "@/components/auth/auth-form-card";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export function LoginScreen() {
  return (
    <AuthShell>
      <AuthFormCard>
        <AuthEntryHeader />
        <LoginForm />
      </AuthFormCard>
    </AuthShell>
  );
}
