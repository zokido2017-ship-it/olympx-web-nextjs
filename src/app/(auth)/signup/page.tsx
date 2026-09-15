import type { Metadata } from "next";
import { SignupScreen } from "@/components/auth/signup-screen";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Sportxo account with phone or Google sign-in.",
};

export default function SignupPage() {
  return <SignupScreen />;
}
