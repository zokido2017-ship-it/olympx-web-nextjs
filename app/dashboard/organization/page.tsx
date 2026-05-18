import type { Metadata } from "next";

import { OrganizationManagementPanel } from "@/components/organization/organization-management";

export const metadata: Metadata = {
  title: "Organizations | Olympx",
  description: "Manage clubs, leagues, federations, and brand partners.",
};

export default function DashboardOrganizationPage() {
  return <OrganizationManagementPanel />;
}
