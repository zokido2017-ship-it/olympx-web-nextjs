import type { PlayerProfile } from "@/types/player-profile";
import { AchievementsSection } from "@/components/profile/achievements-section";
import { CurrentTeamsSection } from "@/components/profile/current-teams-section";
import { PerformanceOverviewSection } from "@/components/profile/performance-overview-section";
import { PlayerMatchesSection } from "@/components/profile/player-matches-section";
import { PlayerProfileHeader } from "@/components/profile/player-profile-header";
import { PlayerStatsRow } from "@/components/profile/player-stats-row";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileSection } from "@/components/profile/profile-section";
import { RecentActivitySection } from "@/components/profile/recent-activity-section";

type PlayerProfileViewProps = {
  profile: PlayerProfile;
};

export function PlayerProfileView({ profile }: PlayerProfileViewProps) {
  return (
    <div className="space-y-6">
      <PlayerProfileHeader profile={profile} />

      <ProfileCard className="py-5">
        <ProfileSection
          title="Player Statistics"
          description="Competitive record across registered sports"
        >
          <PlayerStatsRow stats={profile.stats} />
        </ProfileSection>
      </ProfileCard>

      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-6">
        <div className="space-y-6">
          <PerformanceOverviewSection metrics={profile.performance} />
          <PlayerMatchesSection matches={profile.matches} />
          <RecentActivitySection activity={profile.recentActivity} />
        </div>

        <div className="space-y-6">
          <CurrentTeamsSection teams={profile.teams} />
          <AchievementsSection achievements={profile.achievements} />
        </div>
      </div>
    </div>
  );
}
