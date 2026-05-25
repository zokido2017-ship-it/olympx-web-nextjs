"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CircleHelp, Search, Settings } from "lucide-react";

import { ManagementNavbarUserMenu } from "@/components/management-hub/management-navbar-user-menu";
import { Input } from "@/components/ui/input";
import { ORG_PROFILE_SLUG_DEFAULT, getOrganizationBasePath } from "@/lib/management-nav";
import { cn } from "@/lib/utils";

const DASHBOARD_HOME_HREF = getOrganizationBasePath(ORG_PROFILE_SLUG_DEFAULT);

const TOP_LINKS = [
  { href: DASHBOARD_HOME_HREF, label: "Dashboard", id: "dashboard" as const },
  {
    href: "/organizations/analytics",
    label: "Analytics",
    id: "analytics" as const,
  },
  { href: "/organizations/reports", label: "Reports", id: "reports" as const },
];

export function ManagementNavbar() {
  const pathname = usePathname();
  /** Reference UI highlights Analytics on the main Organizations view. */
  const activeTopNav = pathname.startsWith("/organizations/reports")
    ? "reports"
    : "analytics";
  const searchTeamsArea =
    pathname.startsWith("/teams") || pathname.startsWith("/players");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-6 sm:gap-6 sm:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative w-full max-w-xl">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              type="search"
              placeholder={
                searchTeamsArea
                  ? "Search teams, captains, or leagues..."
                  : "Search organizations, leagues, or IDs..."
              }
              className={cn(
                "h-10 rounded-lg border border-slate-200/90 bg-slate-50/90 pl-10 pr-4 text-sm shadow-sm",
                "placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20",
              )}
              aria-label={
                searchTeamsArea
                  ? "Search teams, captains, or leagues"
                  : "Search organizations, leagues, or IDs"
              }
            />
          </div>

          {pathname.startsWith("/teams") ? (
            <span className="hidden rounded-lg border border-slate-200 bg-slate-50/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 lg:inline-flex">
              Team management
            </span>
          ) : (
            <nav
              className="hidden items-center gap-8 lg:flex"
              aria-label="Hub sections"
            >
              {TOP_LINKS.map(({ href, label, id }) => {
                const active = activeTopNav === id;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative pb-1 text-sm font-semibold transition-colors",
                      active
                        ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-blue-600"
                        : "text-slate-600 hover:text-slate-900",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Help"
          >
            <CircleHelp className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <span
            className="mx-1 hidden h-6 w-px shrink-0 bg-slate-200 md:block"
            aria-hidden
          />

          <ManagementNavbarUserMenu />
        </div>
      </div>
    </header>
  );
}
