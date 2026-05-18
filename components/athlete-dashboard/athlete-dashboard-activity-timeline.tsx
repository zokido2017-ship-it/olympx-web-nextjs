"use client";

import type { ActivityItem } from "@/types/athlete-dashboard";

import { cn } from "@/lib/utils";

type ActivityTimelineProps = {
  items: ActivityItem[];
};

export function AthleteDashboardActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>

      <ul className="relative mt-8 space-y-10 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-12px)] before:w-px before:bg-slate-200">
        {items.map((item) => (
          <li key={item.id} className="relative flex gap-4 pl-8">
            <span
              className={cn(
                "absolute left-0 top-1.5 z-[1] h-3.5 w-3.5 rounded-full border-[3px] border-white shadow-sm",
                item.tone === "recent" ? "bg-blue-600" : "bg-slate-300",
              )}
              aria-hidden
            />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {item.dateLabel}
              </p>
              <p className="mt-2 font-bold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
