import type { PerformanceMetric } from "@/types/player-profile";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileSection } from "@/components/profile/profile-section";

type PerformanceOverviewSectionProps = {
  metrics: PerformanceMetric[];
};

export function PerformanceOverviewSection({
  metrics,
}: PerformanceOverviewSectionProps) {
  return (
    <ProfileCard>
      <ProfileSection
        title="Player Performance Overview"
        description="Form indicators tracked across training and competition"
      >
        <div className="space-y-4">
          {metrics.map((metric) => {
            const pct = Math.round((metric.value / metric.max) * 100);
            return (
              <div key={metric.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-sportxo-navy">
                    {metric.label}
                  </span>
                  <span className="font-bold text-sportxo-blue">
                    {metric.value}
                    {metric.unit ?? ""}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sportxo-blue to-[#60A5FA]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ProfileSection>
    </ProfileCard>
  );
}
