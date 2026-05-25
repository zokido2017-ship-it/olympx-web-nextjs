import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

/**
 * Shared shell for the organizations dashboard: fixed sidebar, top navbar, light theme.
 * Organization profile uses a dedicated chrome to match the public dashboard reference.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardShell>{children}</DashboardShell>;
}
