"use client";

import { ChevronRight, Medal, Trophy } from "lucide-react";

import type { TrophyItem } from "@/types/athlete-dashboard";

import { cn } from "@/lib/utils";

type TrophyShowcaseProps = {
  trophies: TrophyItem[];
};

export function AthleteDashboardTrophyShowcase({ trophies }: TrophyShowcaseProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">Trophy Showcase</h2>
        <button
          type="button"
          className="flex items-center gap-0.5 text-sm font-bold text-blue-600 transition hover:text-blue-700"
        >
          View All
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {trophies.map((t) => (
          <div
            key={t.id}
            className="rounded-lg bg-slate-100 p-4 ring-1 ring-slate-200/80 transition hover:bg-slate-200/50"
          >
            {t.tone === "gold" ? (
              <Trophy className={cn("h-7 w-7 text-amber-500")} aria-hidden />
            ) : (
              <Medal className="h-7 w-7 text-slate-400" aria-hidden />
            )}
            <p className="mt-3 text-sm font-bold leading-snug text-slate-900">{t.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
