"use client";

import { Flag, Plus, Shield } from "lucide-react";

import { CreateOrgSectionCard } from "./create-org-section-card";

type HierarchyPreviewCardProps = {
  displayName: string;
};

export function HierarchyPreviewCard({ displayName }: HierarchyPreviewCardProps) {
  return (
    <CreateOrgSectionCard
      title="Hierarchy Preview"
      description="Once created, you can establish your internal structure."
      contentClassName="pt-6"
    >
      <div className="relative overflow-x-auto pl-1">
        <ul className="space-y-0 text-sm text-slate-800" role="list">
          <li className="relative flex gap-3 font-semibold">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 shadow-sm">
              <Flag className="h-4 w-4 text-slate-600" strokeWidth={2} />
            </span>
            <span className="pt-1.5">{displayName}</span>
          </li>

          <li className="relative mt-1">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" aria-hidden />
            <div className="relative ml-9 pl-5 pt-3">
              <div
                className="absolute left-0 top-5 h-px w-4 bg-slate-200"
                aria-hidden
              />
              <div className="flex gap-3 font-semibold">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 shadow-sm">
                  <Shield className="h-4 w-4 text-blue-600" strokeWidth={2} />
                </span>
                <span className="pt-1.5">First Team (U18)</span>
              </div>

              <div className="relative ml-7 mt-4 border-l border-slate-200 pl-5">
                <div className="absolute left-0 top-3 h-px w-4 bg-slate-200" aria-hidden />
                <div className="flex items-start gap-2.5 text-slate-500">
                  <Plus className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                  <span className="text-sm font-medium leading-snug">
                    Add more teams later
                  </span>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </CreateOrgSectionCard>
  );
}
