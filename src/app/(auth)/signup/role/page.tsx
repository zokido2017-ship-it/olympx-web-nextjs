import type { Metadata } from "next";
import { RoleSelectionScreen } from "@/components/auth/role-selection-screen";

export const metadata: Metadata = {
  title: "Choose your role",
  description: "Select how you want to use Sportxo.",
};

export default function SignupRolePage() {
  return <RoleSelectionScreen />;
}
