"use client";

import { Brain } from "lucide-react";

import type { AiInsightsData } from "@/types/athlete-dashboard";

type AiPerformanceCardProps = {
  data: AiInsightsData;
};

export function AthleteDashboardAiPerformanceCard({ data }: AiPerformanceCardProps) {
  const pct = Math.min(100, Math.max(0, data.recoveryPercent));

  return (
    <section className="rounded-xl bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50/80 p-6 shadow-sm ring-1 ring-blue-100/90">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Brain className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{data.title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">{data.description}</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-800">
          {data.badge}
        </span>
      </div>

      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-700">{data.body}</p>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm font-bold text-slate-800">
          <span>{data.recoveryLabel}</span>
          <span className="text-blue-700">{data.recoveryCaption}</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200/90">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </section>
  );
}
