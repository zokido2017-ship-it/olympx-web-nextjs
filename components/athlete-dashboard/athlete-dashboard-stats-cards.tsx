"use client";

import { CheckCircle2, Medal } from "lucide-react";

import type { StatCardData } from "@/types/athlete-dashboard";

import { cn } from "@/lib/utils";

type StatsCardsProps = {
  stats: StatCardData[];
};

export function AthleteDashboardStatsCards({ stats }: StatsCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        if (stat.kind === "medals") {
          return (
            <article
              key={stat.id}
              className="rounded-xl bg-blue-600 p-6 text-white shadow-md ring-1 ring-blue-700/30"
            >
              <Medal className="h-8 w-8 opacity-95" aria-hidden />
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-blue-100">
                {stat.label}
              </p>
              <p className="mt-1 text-3xl font-black tracking-tight">{stat.value}</p>
            </article>
          );
        }

        if (stat.kind === "lastMatch") {
          return (
            <article
              key={stat.id}
              className="relative overflow-hidden rounded-xl bg-blue-50 p-6 shadow-sm ring-1 ring-blue-100"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-blue-700">
                {stat.label}
              </p>
              <p className="mt-4 text-lg font-bold text-slate-900">{stat.sublabel}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">{stat.accent}</p>
              <div className="pointer-events-none absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm ring-1 ring-blue-100">
                <span aria-hidden>⚽</span>
              </div>
            </article>
          );
        }

        const isWins = stat.id === "wins";

        return (
          <article
            key={stat.id}
            className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md"
          >
            <div className="flex h-9 items-start">
              {isWins ? (
                <CheckCircle2 className="h-8 w-8 text-blue-600" aria-hidden />
              ) : (
                <span className="text-3xl leading-none" aria-hidden>
                  {stat.emoji}
                </span>
              )}
            </div>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className={cn("mt-1 text-3xl font-black tracking-tight text-slate-900")}>{stat.value}</p>
            {stat.accent ? (
              <p className="mt-2 text-xs font-bold text-blue-600">{stat.accent}</p>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
