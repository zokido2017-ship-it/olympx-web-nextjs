"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "@/constants/dashboard-nav";
import { DashboardNavLink } from "@/components/dashboard/dashboard-nav-link";
import { SportxoLogo } from "@/components/auth/sportxo-logo";
import {
  clearAuthenticated,
  clearPlayerProfileComplete,
  clearStoredPlayerId,
} from "@/lib/auth-session";
import { clearVerifiedPhoneSession } from "@/lib/auth-verified-phone";
import { clearPlayerWizardDraft } from "@/lib/player-wizard-draft";
import { cn } from "@/lib/cn";

type DashboardSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function DashboardSidebar({
  onNavigate,
  className,
}: DashboardSidebarProps) {
  const router = useRouter();

  const onLogout = () => {
    clearAuthenticated();
    clearVerifiedPhoneSession();
    clearPlayerProfileComplete();
    clearStoredPlayerId();
    clearPlayerWizardDraft();
    onNavigate?.();
    router.replace("/login");
  };

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
        <SportxoLogo variant="dark" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Dashboard">
        {DASHBOARD_NAV_ITEMS.map((item) => (
          <DashboardNavLink
            key={item.href}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border bg-sidebar p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          Logout
        </button>
        <p className="mt-4 text-xs text-sidebar-foreground/50">
          Sportxo management dashboard
        </p>
      </div>
    </aside>
  );
}
