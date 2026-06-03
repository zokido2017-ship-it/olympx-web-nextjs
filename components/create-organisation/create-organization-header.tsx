"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  hubAccentTextClass,
  hubEyebrowClass,
  hubPrimaryButtonClass,
  hubSecondaryButtonClass,
} from "@/lib/management-hub-theme";
import { cn } from "@/lib/utils";

type CreateOrganizationHeaderProps = {
  onSaveDraft: () => void;
  onPublish: () => void;
  publishing?: boolean;
  /** Shown after failed validation attempt */
  headerNotice?: ReactNode;
};

export function CreateOrganizationHeader({
  onSaveDraft,
  onPublish,
  publishing = false,
  headerNotice,
}: CreateOrganizationHeaderProps) {
  return (
    <header className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-4">
          <p className={hubEyebrowClass}>New organization</p>
          <nav
            className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-slate-800">
              Home
            </Link>
            <ChevronRight className="mx-0.5 h-3 w-3 shrink-0 text-slate-400" />
            <Link
              href="/organizations"
              className="transition-colors hover:text-slate-800"
            >
              Organizations
            </Link>
            <ChevronRight className="mx-0.5 h-3 w-3 shrink-0 text-slate-400" />
            <span className={hubAccentTextClass}>Create</span>
          </nav>
          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Create Organization
            </h1>
            <p className="text-base leading-relaxed text-slate-600">
              Build your sports identity, manage teams, tournaments, and players with our
              advanced kinetic toolkit.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={publishing}
            className={cn(
              "h-11 rounded-xl px-5 text-sm font-semibold shadow-sm",
              hubSecondaryButtonClass,
            )}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            onClick={onPublish}
            disabled={publishing}
            aria-busy={publishing}
            className={cn(
              "h-11 rounded-xl px-6 text-sm font-semibold shadow-md",
              hubPrimaryButtonClass,
            )}
          >
            {publishing ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>
      {headerNotice}
    </header>
  );
}
