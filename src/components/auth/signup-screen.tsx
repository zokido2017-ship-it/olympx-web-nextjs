import { LoginCard } from "@/components/auth/login-card";
import { LoginCardHeader } from "@/components/auth/login-card-header";
import { SignupForm } from "@/components/auth/signup-form";

export function SignupScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sportxo-page px-6 py-12">
      <LoginCard>
        <LoginCardHeader
          title="Create account"
          subtitle="Log in or create account to join the Sportxo ecosystem."
        />
        <div className="px-8 pb-8 pt-2">
          <SignupForm />
        </div>
      </LoginCard>
    </main>
  );
}
