import type { Metadata } from "next";
import { LoginScreen } from "@/components/auth/login-screen";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Sportxo.",
};

export default function LoginPage() {
  return <LoginScreen />;
}
