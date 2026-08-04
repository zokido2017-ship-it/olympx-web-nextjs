import type { PlayerTeam } from "@/types/player-profile";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileSection } from "@/components/profile/profile-section";

type CurrentTeamsSectionProps = {
  teams: PlayerTeam[];
};

export function CurrentTeamsSection({ teams }: CurrentTeamsSectionProps) {
  return (
    <ProfileCard>
      <ProfileSection title="Current Teams">
        <ul className="space-y-3">
          {teams.map((team) => (
            <li
              key={team.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-sportxo-border/70 bg-[#F8FAFC] px-4 py-3"
            >
              <div>
                <p className="text-sm font-bold text-sportxo-navy">{team.name}</p>
                <p className="mt-0.5 text-xs text-sportxo-text-muted">
                  {team.role} · Since {team.since}
                </p>
              </div>
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-sportxo-blue">
                {team.sport}
              </span>
            </li>
          ))}
        </ul>
      </ProfileSection>
    </ProfileCard>
  );
}
