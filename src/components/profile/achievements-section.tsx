import { HiTrophy } from "react-icons/hi2";
import type { PlayerAchievement } from "@/types/player-profile";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileSection } from "@/components/profile/profile-section";

type AchievementsSectionProps = {
  achievements: PlayerAchievement[];
};

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  return (
    <ProfileCard>
      <ProfileSection title="Achievements / Awards">
        <ul className="space-y-3">
          {achievements.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-xl border border-sportxo-border/70 px-4 py-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-sportxo-blue">
                <HiTrophy className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-sportxo-navy">{item.title}</p>
                <p className="mt-0.5 text-xs text-sportxo-text-muted">
                  {item.organization}
                </p>
                <p className="mt-1 text-xs font-medium text-sportxo-blue">
                  {item.category}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-sportxo-text-muted">
                {item.year}
              </span>
            </li>
          ))}
        </ul>
      </ProfileSection>
    </ProfileCard>
  );
}
