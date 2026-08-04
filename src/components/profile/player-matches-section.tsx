import type { PlayerMatch } from "@/types/player-profile";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileSection } from "@/components/profile/profile-section";
import { cn } from "@/lib/cn";

type PlayerMatchesSectionProps = {
  matches: PlayerMatch[];
};

function MatchResultBadge({ match }: { match: PlayerMatch }) {
  if (match.status === "upcoming") {
    return (
      <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-sportxo-blue">
        Upcoming
      </span>
    );
  }

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        match.result === "win" && "bg-[#DCFCE7] text-[#166534]",
        match.result === "loss" && "bg-[#FEE2E2] text-[#991B1B]",
        match.result === "draw" && "bg-[#F1F5F9] text-sportxo-text-muted",
      )}
    >
      {match.result === "win"
        ? "Win"
        : match.result === "loss"
          ? "Loss"
          : "Draw"}
    </span>
  );
}

export function PlayerMatchesSection({ matches }: PlayerMatchesSectionProps) {
  const recent = matches.filter((m) => m.status === "completed");
  const upcoming = matches.filter((m) => m.status === "upcoming");

  return (
    <ProfileCard>
      <ProfileSection
        title="Recent / Upcoming Matches"
        description="Latest results and scheduled fixtures"
      >
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-sportxo-text-muted">
              Recent
            </h3>
            <ul className="space-y-3">
              {recent.map((match) => (
                <li
                  key={match.id}
                  className="rounded-xl border border-sportxo-border/70 bg-[#F8FAFC] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-sportxo-navy">
                        vs {match.opponent}
                      </p>
                      <p className="mt-0.5 text-xs text-sportxo-text-muted">
                        {match.tournament} · {match.sport}
                      </p>
                    </div>
                    <MatchResultBadge match={match} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-sportxo-text-muted">
                    <span>{match.date}</span>
                    {match.score ? (
                      <span className="font-semibold text-sportxo-navy">
                        {match.score}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-sportxo-text-muted">
              Upcoming
            </h3>
            <ul className="space-y-3">
              {upcoming.map((match) => (
                <li
                  key={match.id}
                  className="rounded-xl border border-dashed border-sportxo-blue/25 bg-[#F8FBFF] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-sportxo-navy">
                        vs {match.opponent}
                      </p>
                      <p className="mt-0.5 text-xs text-sportxo-text-muted">
                        {match.tournament} · {match.sport}
                      </p>
                    </div>
                    <MatchResultBadge match={match} />
                  </div>
                  <p className="mt-2 text-xs text-sportxo-text-muted">{match.date}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ProfileSection>
    </ProfileCard>
  );
}
