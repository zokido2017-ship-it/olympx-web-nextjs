import type { LucideIcon } from "lucide-react";
import { Building2, UsersRound } from "lucide-react";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    title: "Create Team",
    href: "/dashboard/create-team",
    icon: UsersRound,
  },
  {
    title: "Create Organization",
    href: "/dashboard/create-organization",
    icon: Building2,
  },
];

export function getDashboardPageTitle(pathname: string): string {
  const item = DASHBOARD_NAV_ITEMS.find((nav) => nav.href === pathname);
  return item?.title ?? "Dashboard";
}
