"use client";

import { athleteDashboardMock } from "@/lib/data/athlete-dashboard.mock";
import type { AthleteDashboardData } from "@/types/athlete-dashboard";

import { AthleteDashboardActivityTimeline } from "./athlete-dashboard-activity-timeline";
import { AthleteDashboardActiveSports } from "./athlete-dashboard-active-sports";
import { AthleteDashboardAiPerformanceCard } from "./athlete-dashboard-ai-performance-card";
import { AthleteDashboardHeroBanner } from "./athlete-dashboard-hero-banner";
import { AthleteDashboardSponsorsCard } from "./athlete-dashboard-sponsors-card";
import { AthleteDashboardStatsCards } from "./athlete-dashboard-stats-cards";
import { AthleteDashboardTeamsCard } from "./athlete-dashboard-teams-card";
import { AthleteDashboardTrophyShowcase } from "./athlete-dashboard-trophy-showcase";

type OverviewProps = {
  /** Use when rendering from another Client Component (e.g. shell). Do not pass from an RSC with full `AthleteDashboardData` — `navItems` contains icon components. */
  data?: AthleteDashboardData;
};

export function AthleteDashboardOverview({ data = athleteDashboardMock }: OverviewProps) {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <AthleteDashboardHeroBanner athlete={data.athlete} />
      <AthleteDashboardActiveSports sports={data.sports} activeSportId={data.activeSportId} />
      <AthleteDashboardStatsCards stats={data.stats} />
      <AthleteDashboardAiPerformanceCard data={data.aiInsights} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
        <div className="space-y-6 xl:col-span-8">
          <AthleteDashboardActivityTimeline items={data.activity} />
        </div>
        <div className="space-y-6 xl:col-span-4">
          <AthleteDashboardSponsorsCard sponsors={data.sponsors} />
          <AthleteDashboardTeamsCard teams={data.teams} />
          <AthleteDashboardTrophyShowcase trophies={data.trophies} />
        </div>
      </div>
    </div>
  );
}
