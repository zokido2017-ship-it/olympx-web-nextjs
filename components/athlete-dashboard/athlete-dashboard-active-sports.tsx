"use client";

import type { AthleteDashboardData } from "@/types/athlete-dashboard";

import { cn } from "@/lib/utils";

type ActiveSportsProps = {
  sports: AthleteDashboardData["sports"];
  activeSportId: string;
};

export function AthleteDashboardActiveSports({ sports, activeSportId }: ActiveSportsProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Active Sports</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:max-w-lg">
        {sports.map((sport) => {
          const active = sport.id === activeSportId;
          return (
            <div
              key={sport.id}
              className={cn(
                "flex flex-col items-center gap-3 rounded-xl px-4 py-6 transition-all",
                active
                  ? "bg-blue-50 ring-2 ring-blue-200 shadow-sm"
                  : "bg-slate-100 ring-1 ring-slate-200/80 hover:bg-slate-200/60",
              )}
            >
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl text-3xl shadow-inner",
                  active ? "bg-blue-100" : "bg-white",
                )}
              >
                <span aria-hidden>{sport.emoji}</span>
              </div>
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.14em]",
                  active ? "text-blue-700" : "text-slate-600",
                )}
              >
                {sport.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
