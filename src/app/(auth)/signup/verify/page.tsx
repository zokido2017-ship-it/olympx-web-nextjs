import type { Metadata } from "next";
import { LoginCard } from "@/components/auth/login-card";
import { LoginCardHeader } from "@/components/auth/login-card-header";
import { SignupOtpForm } from "@/components/auth/signup-otp-form";

export const metadata: Metadata = {
  title: "Verify phone",
  description: "Verify your phone number to complete Sportxo registration.",
};

export default function SignupVerifyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sportxo-page px-6 py-12">
      <LoginCard>
        <LoginCardHeader
          title="Verify phone"
          subtitle="Enter the code we sent to your mobile number."
        />
        <div className="px-8 pb-8 pt-2">
          <SignupOtpForm />
        </div>
      </LoginCard>
    </main>
  );
}
