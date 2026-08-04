import { LoginCard } from "@/components/auth/login-card";
import { RoleSelectionForm } from "@/components/auth/role-selection-form";

export function RoleSelectionScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sportxo-page px-6 py-12">
      <LoginCard className="max-w-[520px]">
        <div className="px-8 pb-8 pt-8">
          <RoleSelectionForm />
        </div>
      </LoginCard>
    </main>
  );
}
