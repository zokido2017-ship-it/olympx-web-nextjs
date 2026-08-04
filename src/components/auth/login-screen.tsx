import { LoginCard } from "@/components/auth/login-card";
import { LoginCardHeader } from "@/components/auth/login-card-header";
import { LoginForm } from "@/components/auth/login-form";

export function LoginScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sportxo-page px-6 py-12">
      <LoginCard>
        <LoginCardHeader />
        <div className="px-8 pb-8 pt-2">
          <LoginForm />
        </div>
      </LoginCard>
    </main>
  );
}
