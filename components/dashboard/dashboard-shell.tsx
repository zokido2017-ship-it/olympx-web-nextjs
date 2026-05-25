"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { DashboardUserProvider } from "@/components/dashboard/dashboard-user-context";
import { OrganizationProfileChrome } from "@/components/organization-profile/organization-profile-chrome";
import { ManagementNavbar } from "@/components/management-hub/management-navbar";
import { ManagementSidebar } from "@/components/management-hub/management-sidebar";
import { isOrganizationProfileShellPath } from "@/lib/management-nav";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <DashboardUserProvider>
      {isOrganizationProfileShellPath(pathname) ? (
        <Suspense
          fallback={
            <div className="flex min-h-dvh items-center justify-center bg-[#F8FAFC] text-sm font-medium text-slate-500">
              Loading…
            </div>
          }
        >
          <OrganizationProfileChrome>{children}</OrganizationProfileChrome>
        </Suspense>
      ) : (
        <div className="flex h-dvh overflow-hidden bg-slate-50">
          <ManagementSidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <ManagementNavbar />
            {children}
            <footer className="shrink-0 border-t border-slate-200/60 bg-slate-50 py-6 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
              Olympx Sports Management Infrastructure © 2024
            </footer>
          </div>
        </div>
      )}
    </DashboardUserProvider>
  );
}
