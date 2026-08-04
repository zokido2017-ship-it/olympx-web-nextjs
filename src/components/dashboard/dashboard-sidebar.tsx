import { DASHBOARD_NAV_ITEMS } from "@/constants/dashboard-nav";
import { DashboardNavLink } from "@/components/dashboard/dashboard-nav-link";
import { Separator } from "@/components/ui/separator";
import { SportxoLogo } from "@/components/auth/sportxo-logo";

type DashboardSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function DashboardSidebar({
  onNavigate,
  className,
}: DashboardSidebarProps) {
  return (
    <aside
      className={`flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground ${className ?? ""}`}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <SportxoLogo variant="light" />
      </div>

      <nav className="flex-1 space-y-1 p-4" aria-label="Dashboard">
        {DASHBOARD_NAV_ITEMS.map((item) => (
          <DashboardNavLink
            key={item.href}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="p-4">
        <Separator className="mb-4 bg-sidebar-border" />
        <p className="text-xs text-sidebar-foreground/60">
          Sportxo management dashboard
        </p>
      </div>
    </aside>
  );
}
