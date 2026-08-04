import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your Sportxo account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthScreen>
      <ForgotPasswordForm />
    </AuthScreen>
  );
}
