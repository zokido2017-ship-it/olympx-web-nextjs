"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const SECTION_TABS = [
  "Overview",
  "Matches",
  "Teams & players",
  "Ranking",
  "Tournaments",
  "Media",
  "Sponsorship",
] as const;

export function OrganizationProfileSectionTabs() {
  const [active, setActive] = useState<(typeof SECTION_TABS)[number]>("Overview");

  return (
    <div className="border-b border-slate-200/90 bg-white/80">
      <div className="mx-auto flex max-w-[1200px] gap-8 overflow-x-auto px-8 pb-0 pt-2 [scrollbar-width:thin]">
        {SECTION_TABS.map((label) => {
          const selected = active === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setActive(label)}
              className={cn(
                "relative shrink-0 pb-3 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors",
                selected
                  ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-t-full after:bg-blue-600"
                  : "text-slate-400 hover:text-slate-700",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
