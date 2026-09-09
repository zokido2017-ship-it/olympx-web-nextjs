import type { Metadata } from "next";
import { LoginCard } from "@/components/auth/login-card";
import { LoginCardHeader } from "@/components/auth/login-card-header";
import { SignupPhoneForm } from "@/components/auth/signup-phone-form";

export const metadata: Metadata = {
  title: "Add phone number",
  description: "Add your phone number after Google sign-in to complete registration.",
};

export default function SignupPhonePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sportxo-page px-6 py-12">
      <LoginCard>
        <LoginCardHeader
          title="Almost there"
          subtitle="Add your phone number to finish creating your account."
        />
        <div className="px-8 pb-8 pt-2">
          <SignupPhoneForm />
        </div>
      </LoginCard>
    </main>
  );
}
