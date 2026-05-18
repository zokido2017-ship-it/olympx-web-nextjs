"use client";

import type { SponsorItem } from "@/types/athlete-dashboard";

type SponsorsCardProps = {
  sponsors: SponsorItem[];
};

export function AthleteDashboardSponsorsCard({ sponsors }: SponsorsCardProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Official Sponsors</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {sponsors.map((s) => (
          <div
            key={s.id}
            className="flex min-h-[4.25rem] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-4 text-center shadow-inner"
          >
            <span className="text-xs font-black uppercase tracking-wide text-slate-700">{s.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
