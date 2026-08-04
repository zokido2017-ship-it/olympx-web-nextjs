import type { PlayerStat } from "@/types/player-profile";
import { ProfileStatTile } from "@/components/profile/profile-stat-tile";

type PlayerStatsRowProps = {
  stats: PlayerStat[];
};

export function PlayerStatsRow({ stats }: PlayerStatsRowProps) {
  return (
    <div className="grid grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <ProfileStatTile
          key={stat.key}
          label={stat.label}
          value={stat.value}
          helper={stat.helper}
          highlight={index === 2}
        />
      ))}
    </div>
  );
}
