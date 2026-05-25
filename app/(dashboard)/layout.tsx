import { RequireOlympxAuth } from "@/components/auth/require-olympx-auth";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardMain } from "@/components/dashboard/dashboard-main";
import type { ReactNode } from "react";

export default function DashboardRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireOlympxAuth>
      <DashboardLayout>
        <DashboardMain>{children}</DashboardMain>
      </DashboardLayout>
    </RequireOlympxAuth>
  );
}
