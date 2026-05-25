"use client";

import type { ReactNode } from "react";

import { createOrgCardShell } from "@/lib/management-hub-theme";
import { cn } from "@/lib/utils";

type CreateOrgSectionCardProps = {
  title: string;
  /** Icon or element shown inline after the title (e.g. link icon). */
  titleSuffix?: ReactNode;
  description?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function CreateOrgSectionCard({
  title,
  titleSuffix,
  description,
  headerRight,
  children,
  className,
  contentClassName,
}: CreateOrgSectionCardProps) {
  return (
    <section className={cn(createOrgCardShell, className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-6 pb-4 pt-6">
        <div className="min-w-0 space-y-1">
          <h2 className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-900">
            <span>{title}</span>
            {titleSuffix}
          </h2>
          {description ? (
            <p className="text-sm leading-snug text-slate-500">{description}</p>
          ) : null}
        </div>
        {headerRight}
      </div>
      <div className={cn("px-6 pb-6 pt-5", contentClassName)}>{children}</div>
    </section>
  );
}
