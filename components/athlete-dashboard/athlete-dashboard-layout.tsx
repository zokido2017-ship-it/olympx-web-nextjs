"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { athleteDashboardMock } from "@/lib/data/athlete-dashboard.mock";
import type { AthleteDashboardData, DashboardNavId } from "@/types/athlete-dashboard";

import { AthleteDashboardNavbar } from "./athlete-dashboard-navbar";
import { AthleteDashboardSidebar } from "./athlete-dashboard-sidebar";

type DashboardLayoutProps = {
  children: React.ReactNode;
  data?: AthleteDashboardData;
};

export function AthleteDashboardLayout({
  children,
  data = athleteDashboardMock,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [dashSection, setDashSection] = React.useState<DashboardNavId>(
    data.defaultNavId,
  );
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const activeId = React.useMemo<DashboardNavId>(() => {
    if (pathname.startsWith("/dashboard/organization")) return "organizations";
    return dashSection;
  }, [pathname, dashSection]);

  const navigateTo = React.useCallback(
    (id: DashboardNavId) => {
      if (id === "organizations") {
        router.push("/dashboard/organization");
        setMobileNavOpen(false);
        return;
      }
      setDashSection(id);
      router.push("/dashboard");
      setMobileNavOpen(false);
    },
    [router],
  );

  React.useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  return (
    <div className="min-h-dvh bg-[#f3f4f6] text-slate-800 antialiased">
      <AthleteDashboardSidebar
        data={data}
        activeId={activeId}
        onNavigate={navigateTo}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="lg:pl-72">
        <AthleteDashboardNavbar brand={data.brand} onOpenSidebar={() => setMobileNavOpen(true)} />

        <main className="px-4 pb-12 pt-[8rem] md:px-6 md:pt-16 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
