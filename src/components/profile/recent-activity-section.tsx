import {
  HiBolt,
  HiStar,
  HiTrophy,
  HiUserGroup,
} from "react-icons/hi2";
import type { PlayerActivity } from "@/types/player-profile";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileSection } from "@/components/profile/profile-section";
import { cn } from "@/lib/cn";

const activityIconMap = {
  match: HiTrophy,
  training: HiBolt,
  tournament: HiUserGroup,
  award: HiStar,
} as const;

type RecentActivitySectionProps = {
  activity: PlayerActivity[];
};

export function RecentActivitySection({ activity }: RecentActivitySectionProps) {
  return (
    <ProfileCard>
      <ProfileSection title="Recent Activity">
        <ul className="space-y-3">
          {activity.map((item) => {
            const Icon = activityIconMap[item.type];
            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-sportxo-border/70 px-4 py-3"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-sportxo-blue",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-sportxo-navy">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-sportxo-text-muted">
                    {item.detail}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-sportxo-text-muted">
                  {item.timestamp}
                </span>
              </li>
            );
          })}
        </ul>
      </ProfileSection>
    </ProfileCard>
  );
}
