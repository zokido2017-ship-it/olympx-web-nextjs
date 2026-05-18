"use client";

import { athleteDashboardMock } from "@/lib/data/athlete-dashboard.mock";
import type { AthleteDashboardData } from "@/types/athlete-dashboard";

import { AthleteDashboardLayout } from "./athlete-dashboard-layout";
import { AthleteDashboardOverview } from "./athlete-dashboard-overview";

type ShellProps = {
  data?: AthleteDashboardData;
};

/** Full dashboard chrome + overview — used on `/profile` and standalone. `/dashboard` uses layout + pages instead. */
export function AthleteDashboardShell({ data = athleteDashboardMock }: ShellProps) {
  return (
    <AthleteDashboardLayout data={data}>
      <AthleteDashboardOverview data={data} />
    </AthleteDashboardLayout>
  );
}
