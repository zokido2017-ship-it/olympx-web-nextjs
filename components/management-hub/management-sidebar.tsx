"use client";

import Link from "next/link";
import { Building2, Plus, Shield, UserSquare2 } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  ManagementNavExpandableGroup,
  type ManagementNavSubItem,
} from "./management-nav-expandable-group";

const SIDEBAR_W = "w-[260px] min-w-[260px]";

const ORGANIZATION_SUB: ManagementNavSubItem[] = [
  { href: "/organizations", label: "All Organizations" },
  { href: "/organizations/create", label: "Create Organization" },
];

const TEAMS_SUB: ManagementNavSubItem[] = [
  { href: "/teams", label: "All Teams" },
  { href: "/teams/create", label: "Create Team" },
];

export function ManagementSidebar() {
  return (
    <aside
      className={cn(
        SIDEBAR_W,
        "flex h-screen flex-col border-r border-slate-200/80 bg-white backdrop-blur-sm",
      )}
    >
      <div className="flex h-full flex-col px-4 pb-6 pt-8">
        <Link href="/organizations" className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/25">
            <Shield className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold uppercase tracking-tight text-slate-900">
              Olympx
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Admin console
            </p>
          </div>
        </Link>

        <nav
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]"
          aria-label="Management hub"
        >
          <ManagementNavExpandableGroup
            id="nav-orgs"
            label="Organizations"
            icon={Building2}
            pathPrefix="/organizations"
            storageKey="mgmt-sidebar-orgs-v1"
            subItems={ORGANIZATION_SUB}
          />

          <ManagementNavExpandableGroup
            id="nav-teams"
            label="Teams"
            icon={UserSquare2}
            pathPrefix="/teams"
            storageKey="mgmt-sidebar-teams-v1"
            subItems={TEAMS_SUB}
          />
        </nav>

        <Link
          href="/teams/create"
          className={cn(
            "mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-[opacity,box-shadow] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          )}
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          New Team
        </Link>
      </div>
    </aside>
  );
}

export const managementSidebarWidthClass = SIDEBAR_W;
