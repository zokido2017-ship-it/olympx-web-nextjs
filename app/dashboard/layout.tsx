import type { ReactNode } from "react";

import type { Metadata } from "next";

import { RequireOlympxAuth } from "@/components/auth/require-olympx-auth";
import { AthleteDashboardLayout } from "@/components/athlete-dashboard/athlete-dashboard-layout";

export const metadata: Metadata = {
  title: "Marcus Thorne — Athlete dashboard | Olympx",
  description: "Premium sports athlete dashboard — stats, insights, sponsors, and activity.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireOlympxAuth>
      <AthleteDashboardLayout>{children}</AthleteDashboardLayout>
    </RequireOlympxAuth>
  );
}
