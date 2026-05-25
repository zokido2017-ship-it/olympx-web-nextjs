import Link from "next/link";
import { Calendar } from "lucide-react";

import { hubCardShell, hubEyebrowClass, hubPrimaryButtonClass } from "@/lib/management-hub-theme";
import { TEAM_PROFILE_SLUG_DEFAULT, getTeamBasePath } from "@/lib/management-nav";
import { cn } from "@/lib/utils";

export default function TeamSchedulePage() {
  const profileHref = getTeamBasePath(TEAM_PROFILE_SLUG_DEFAULT);

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className={hubEyebrowClass}>Teams</p>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            <Calendar className="h-8 w-8 text-blue-600" strokeWidth={2} />
            Team schedule
          </h1>
          <p className="text-slate-600">
            Scrims, league fixtures, and travel blocks — centralized for operations and athletes.
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
          Calendar sync and RSVP workflows will appear here. Hook into your scheduling provider to
          render multi-team timelines.
        </p>
      </div>
    </div>
  );
}
