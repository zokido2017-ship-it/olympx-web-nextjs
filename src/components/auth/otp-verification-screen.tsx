import { LoginCard } from "@/components/auth/login-card";
import { LoginCardHeader } from "@/components/auth/login-card-header";
import { OtpVerificationForm } from "@/components/auth/otp-verification-form";

export function OtpVerificationScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sportxo-page px-6 py-12">
      <LoginCard>
        <LoginCardHeader
          title="OTP Verification"
          subtitle="Enter the 4-digit code we sent to your phone."
        />
        <div className="px-8 pb-8 pt-2">
          <OtpVerificationForm />
        </div>
      </LoginCard>
    </main>
  );
}
