"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import {
  Bell,
  Building2,
  Search,
  Settings,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ORG_PROFILE_SLUG_DEFAULT,
  getOrganizationBasePath,
} from "@/lib/management-nav";
import { cn } from "@/lib/utils";

const SIDEBAR_W = "w-[260px] min-w-[260px]";

type OrgChromeNav = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type ProfileTopLink = {
  view: string;
  label: string;
  href: string;
};

function isSidebarItemActive(pathname: string, orgBase: string, href: string) {
  if (href === orgBase) {
    return pathname === orgBase || pathname === `${orgBase}/`;
  }
  if (href === "/organizations/settings") {
    return (
      pathname === "/organizations/settings" ||
      pathname.startsWith("/organizations/settings/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isTopLinkActive(
  pathname: string,
  search: string,
  orgBase: string,
  item: ProfileTopLink,
) {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const view = params.get("view") ?? "overview";

  if (item.view === "overview") {
    return (
      pathname === orgBase &&
      (view === "overview" || !params.has("view"))
    );
  }

  if (item.view === "matches") {
    return pathname === orgBase && view === "matches";
  }

  if (item.href === "/teams" && item.label === "Teams") {
    return pathname.startsWith("/teams");
  }

  if (item.href === "/players" && item.label === "Roster") {
    return pathname.startsWith("/players");
  }

  if (item.href === "/organizations/analytics") {
    return pathname.startsWith("/organizations/analytics");
  }

  return false;
}

type OrganizationProfileChromeProps = {
  children: ReactNode;
};

export function OrganizationProfileChrome({
  children,
}: OrganizationProfileChromeProps) {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const slug =
    (typeof params.slug === "string" && params.slug) || ORG_PROFILE_SLUG_DEFAULT;
  const orgBase = getOrganizationBasePath(slug);

  const topLinks = React.useMemo<ProfileTopLink[]>(
    () => [
      { view: "overview", label: "Overview", href: orgBase },
      { view: "matches", label: "Matches", href: `${orgBase}?view=matches` },
      { view: "teams", label: "Teams", href: "/teams" },
      { view: "analytics", label: "Analytics", href: "/organizations/analytics" },
      { view: "roster", label: "Roster", href: "/players" },
    ],
    [orgBase],
  );

  const orgChromeNav = React.useMemo<OrgChromeNav[]>(
    () => [
      { href: orgBase, label: "Organization", icon: Building2 },
      { href: `${orgBase}/achievements`, label: "Achievements", icon: Trophy },
      { href: `${orgBase}/financials`, label: "Financials", icon: Wallet },
      { href: `${orgBase}/staff`, label: "Staff", icon: Users },
      { href: "/organizations/settings", label: "Settings", icon: Settings },
    ],
    [orgBase],
  );

  return (
    <div className="flex min-h-dvh bg-[#F8FAFC]">
      <aside
        className={cn(
          SIDEBAR_W,
          "flex h-screen flex-col border-r border-slate-200/80 bg-white",
        )}
      >
        <div className="flex h-full flex-col px-4 pb-6 pt-8">
          <Link href={orgBase} className="mb-10 flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-600/25">
              <span className="text-xs font-black uppercase tracking-tight text-white">
                GE
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">Global Elite</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Premier League Member
              </p>
            </div>
          </Link>

          <Link
            href="/organizations"
            className="mb-6 block px-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 transition-colors hover:text-blue-600"
          >
            ← Management hub
          </Link>

          <nav className="flex flex-1 flex-col gap-1" aria-label="Organization sections">
            {orgChromeNav.map(({ href, label, icon: Icon }) => {
              const active = isSidebarItemActive(pathname, orgBase, href);

              return (
                <Link
                  key={href + label}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", active ? "text-white" : "text-slate-400")} />
                  <span className="uppercase tracking-wide">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 border-t border-slate-100 pt-6">
            <Link
              href={`${orgBase}/upgrade`}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-600/30 transition-opacity hover:opacity-95"
            >
              Upgrade tier
            </Link>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 transition-colors hover:text-slate-800"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-[11px] font-bold">
                ?
              </span>
              Help center
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
          <div className="flex h-[72px] items-center gap-6 px-8">
            <Link
              href={orgBase}
              className="shrink-0 text-lg font-black uppercase tracking-[0.08em] text-[#0f172a]"
            >
              Elite Athletics
            </Link>

            <nav
              className="mx-auto hidden flex-1 items-center justify-center gap-10 lg:flex"
              aria-label="Primary"
            >
              {topLinks.map((item) => {
                const active = isTopLinkActive(
                  pathname,
                  search ? `?${search}` : "",
                  orgBase,
                  item,
                );

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "relative pb-1 text-[13px] font-bold uppercase tracking-[0.14em] transition-colors",
                      active
                        ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-blue-600"
                        : "text-slate-500 hover:text-slate-900",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                aria-label="Search"
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                className="relative rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" strokeWidth={2} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
              <button
                type="button"
                className="rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" strokeWidth={2} />
              </button>
              <Avatar className="ml-2 h-10 w-10 border-2 border-slate-100 shadow-sm">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop"
                  alt=""
                  width={40}
                  height={40}
                />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>

        <footer className="shrink-0 border-t border-slate-200/60 bg-[#F8FAFC] py-5 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Olympx Sports Management Infrastructure © 2024
        </footer>
      </div>
    </div>
  );
}
