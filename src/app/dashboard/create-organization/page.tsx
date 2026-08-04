import type { Metadata } from "next";
import { CreateOrganizationPanel } from "@/components/dashboard/create-organization-panel";

export const metadata: Metadata = {
  title: "Create Organization",
};

export default function CreateOrganizationPage() {
  return <CreateOrganizationPanel />;
}
