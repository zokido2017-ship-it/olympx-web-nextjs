import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { hubCardShell, hubEyebrowClass, hubPrimaryButtonClass } from "@/lib/management-hub-theme";
import { TEAM_PROFILE_SLUG_DEFAULT, getTeamBasePath } from "@/lib/management-nav";
import { cn } from "@/lib/utils";

export default function TeamStatsPage() {
  const profileHref = getTeamBasePath(TEAM_PROFILE_SLUG_DEFAULT);

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className={hubEyebrowClass}>Teams</p>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            <BarChart3 className="h-8 w-8 text-blue-600" strokeWidth={2} />
            Team stats
          </h1>
          <p className="text-slate-600">
            League performance, streaks, and objective control — aggregated for all rosters you manage.
          </p>
        </div>
        <Link
          href={profileHref}
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold",
            hubPrimaryButtonClass,
          )}
        >
          Open team profile
        </Link>
      </header>

      <div className={cn(hubCardShell, "p-8 text-center text-slate-600")}>
        <p className="text-sm font-medium">
          Live stat feeds and charting will mount here. Connect your results API to populate wins,
          K/D, economy, and timeline widgets.
        </p>
      </div>
    </div>
  );
}
