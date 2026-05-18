"use client";

import type { TeamItem } from "@/types/athlete-dashboard";

import { cn } from "@/lib/utils";

type TeamsCardProps = {
  teams: TeamItem[];
};

export function AthleteDashboardTeamsCard({ teams }: TeamsCardProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <h2 className="text-base font-bold text-slate-900">Current Teams</h2>
      <ul className="mt-4 space-y-4">
        {teams.map((team) => (
          <li key={team.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white shadow-sm",
                team.variant === "primary" ? "bg-blue-600" : "bg-sky-400",
              )}
            >
              {team.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900">{team.name}</p>
              <p className="truncate text-sm font-medium text-slate-600">{team.role}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
