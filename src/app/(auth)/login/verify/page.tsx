import type { Metadata } from "next";
import { OtpVerificationScreen } from "@/components/auth/otp-verification-screen";

export const metadata: Metadata = {
  title: "OTP Verification",
  description: "Enter the 4-digit one-time password sent to your phone.",
};

export default function LoginVerifyOtpPage() {
  return <OtpVerificationScreen />;
}
