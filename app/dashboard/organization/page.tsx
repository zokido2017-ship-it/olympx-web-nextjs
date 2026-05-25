import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getOrganizationBasePath, ORG_PROFILE_SLUG_DEFAULT } from "@/lib/management-nav";

export const metadata: Metadata = {
  title: "Organizations | Olympx",
  description: "Manage clubs, leagues, federations, and brand partners.",
};

export default function DashboardOrganizationPage() {
  redirect(getOrganizationBasePath(ORG_PROFILE_SLUG_DEFAULT));
}
