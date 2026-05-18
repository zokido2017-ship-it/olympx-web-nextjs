"use client";

import { Trophy } from "lucide-react";

import type { AthleteDashboardData, DashboardNavId } from "@/types/athlete-dashboard";

import { cn } from "@/lib/utils";

type SidebarProps = {
  data: AthleteDashboardData;
  activeId: DashboardNavId;
  onNavigate(id: DashboardNavId): void;
  mobileOpen: boolean;
  onClose(): void;
};

export function AthleteDashboardSidebar({
  data,
  activeId,
  onNavigate,
  mobileOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[2px] lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-300 lg:z-30 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-5 lg:hidden">
          <span className="text-sm font-bold text-slate-900">{data.brand}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200/80"
          >
            Close
          </button>
        </div>

        <div className="hidden px-5 pb-4 pt-2 lg:block">
          <p className="text-lg font-black tracking-tight text-slate-900">{data.brand}</p>
        </div>

        <div className="px-5 pt-2 lg:pt-0">
          <div className="flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <Trophy className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold text-slate-900">{data.brand}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {data.sidebarTagline[0]}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {data.sidebarTagline[1]}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 px-4">
          <button
            type="button"
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
          >
            New Challenge
          </button>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-8">
          {data.navItems.map(({ id, label, icon: Icon }) => {
            const active = activeId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide transition-colors",
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-500")} />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
