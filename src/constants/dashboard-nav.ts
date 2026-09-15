import type { LucideIcon } from "lucide-react";
import { Building2, UsersRound } from "lucide-react";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    title: "My Teams",
    href: "/dashboard/my-teams",
    icon: UsersRound,
  },
  {
    title: "Create Organization",
    href: "/dashboard/create-organization",
    icon: Building2,
  },
];

export function getDashboardPageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard/my-teams/create")) {
    return "Create Team";
  }
  if (/^\/dashboard\/my-teams\/[^/]+\/members/.test(pathname)) {
    return "Add Team Members";
  }
  if (pathname.startsWith("/dashboard/my-teams")) {
    return "My Teams";
  }

  const item = DASHBOARD_NAV_ITEMS.find((nav) => nav.href === pathname);
  return item?.title ?? "Dashboard";
}
