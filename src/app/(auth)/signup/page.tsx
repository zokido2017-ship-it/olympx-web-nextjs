import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth/auth-screen";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Sportxo account and join the connected sports ecosystem.",
};

export default function SignupPage() {
  return (
    <AuthScreen>
      <SignupForm />
    </AuthScreen>
  );
}
