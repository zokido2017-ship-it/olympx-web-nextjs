"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-sportxo-page">
      <div className="hidden md:flex">
        <DashboardSidebar className="fixed inset-y-0 left-0 z-30" />
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-[min(100%,16rem)] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
          <DashboardSidebar
            onNavigate={() => setMobileNavOpen(false)}
            className="h-full w-full border-0"
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <DashboardHeader
          pathname={pathname}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 bg-sportxo-page p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
