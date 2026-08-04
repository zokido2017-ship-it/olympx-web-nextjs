import Image from "next/image";
import { HiMapPin } from "react-icons/hi2";
import type { PlayerProfile } from "@/types/player-profile";
import { cn } from "@/lib/cn";

type PlayerProfileHeaderProps = {
  profile: PlayerProfile;
};

export function PlayerProfileHeader({ profile }: PlayerProfileHeaderProps) {
  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="overflow-hidden rounded-2xl border border-sportxo-border/80 bg-sportxo-white shadow-sportxo-card">
      <div className="h-28 bg-gradient-to-r from-sportxo-navy via-[#1E3A5F] to-sportxo-blue" />

      <div className="relative px-8 pb-8">
        <div className="-mt-14 flex items-end gap-6">
          <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl border-4 border-sportxo-white bg-[#E2E8F0] shadow-sportxo-card">
            {profile.photoUrl ? (
              <Image
                src={profile.photoUrl}
                alt={profile.name}
                fill
                className="object-cover"
                sizes="112px"
                priority
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-sportxo-navy text-2xl font-bold text-white">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-sportxo-navy">
                {profile.name}
              </h1>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  profile.status === "in-season" &&
                    "bg-[#DCFCE7] text-[#166534]",
                  profile.status === "active" &&
                    "bg-[#EFF6FF] text-sportxo-blue",
                  profile.status === "inactive" &&
                    "bg-[#F1F5F9] text-sportxo-text-muted",
                )}
              >
                {profile.statusLabel}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-sportxo-text-muted">
              <HiMapPin className="size-4 shrink-0 text-sportxo-blue" />
              {profile.location}
            </div>
          </div>

          <div className="w-56 shrink-0 pb-1">
            <div className="flex items-center justify-between text-xs font-medium text-sportxo-text-muted">
              <span>Profile completion</span>
              <span className="text-sportxo-navy">{profile.profileCompletion}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full rounded-full bg-sportxo-blue transition-all"
                style={{ width: `${profile.profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {profile.sports.map((sport) => (
            <span
              key={sport}
              className="rounded-full border border-sportxo-blue/20 bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-sportxo-blue"
            >
              {sport}
            </span>
          ))}
        </div>

        <p className="mt-5 max-w-4xl text-sm leading-relaxed text-sportxo-text-muted">
          {profile.summary}
        </p>
      </div>
    </div>
  );
}
