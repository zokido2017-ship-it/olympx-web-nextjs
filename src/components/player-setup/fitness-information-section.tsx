"use client";

import {
  AppleHealthIcon,
  FitbitIcon,
  FitnessProviderIconTile,
  GoogleFitIcon,
} from "@/components/player-setup/fitness-provider-icons";
import { SetupSectionCard } from "@/components/player-setup/setup-section-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

export type FitnessProvider = "apple" | "google" | "fitbit";

export type FitnessConnectionStatus = "connected" | "disconnected";

type FitnessInformationSectionProps = {
  height: string;
  weight: string;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  connections: Record<FitnessProvider, FitnessConnectionStatus>;
  onToggleConnection: (provider: FitnessProvider) => void;
  wizardMode?: boolean;
};

const wizardPanelClass =
  "border-0 bg-transparent p-0 shadow-none ring-0";

const FITNESS_PROVIDERS: {
  id: FitnessProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "apple",
    name: "Apple Health",
    description: "Sync workouts, activity and health data.",
    icon: (
      <FitnessProviderIconTile>
        <AppleHealthIcon className="size-[26px] text-[#FF2D55]" />
      </FitnessProviderIconTile>
    ),
  },
  {
    id: "google",
    name: "Google Fit",
    description: "Sync activity, workouts and heart rate data.",
    icon: (
      <FitnessProviderIconTile>
        <GoogleFitIcon className="size-[26px]" />
      </FitnessProviderIconTile>
    ),
  },
  {
    id: "fitbit",
    name: "Fitbit",
    description: "Import steps, sleep, and training data.",
    icon: (
      <FitnessProviderIconTile>
        <FitbitIcon className="size-[26px] text-[#00B0B9]" />
      </FitnessProviderIconTile>
    ),
  },
];

export function FitnessInformationSection({
  height,
  weight,
  onHeightChange,
  onWeightChange,
  connections,
  onToggleConnection,
  wizardMode = false,
}: FitnessInformationSectionProps) {
  return (
    <SetupSectionCard
      step={wizardMode ? undefined : "Section 3"}
      title={wizardMode ? undefined : "Fitness Information"}
      hideHeader={wizardMode}
      className={wizardMode ? wizardPanelClass : undefined}
    >
      <div className={cn("space-y-6", wizardMode && "w-full")}>
        <div
          className={cn(
            "grid grid-cols-1 gap-5",
            !wizardMode && "md:grid-cols-2",
          )}
        >
          <div className="space-y-1.5">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              value={height}
              onChange={(event) => onHeightChange(event.target.value)}
              placeholder="e.g. 178 cm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="weight">Weight</Label>
            <Input
              id="weight"
              value={weight}
              onChange={(event) => onWeightChange(event.target.value)}
              placeholder="e.g. 72 kg"
            />
          </div>
        </div>

        <div>
          <p className="text-base font-bold text-[#0B1F3A]">Fitness Sync</p>
          <p className="mt-1 text-sm leading-relaxed text-[#64748B]">
            Connect your fitness platforms to sync activity and performance data.
          </p>

          <ul className="mt-4 space-y-3">
            {FITNESS_PROVIDERS.map((provider) => {
              const connected = connections[provider.id] === "connected";

              return (
                <li key={provider.id}>
                  <div
                    className={cn(
                      "flex items-center justify-between gap-4 rounded-2xl border border-[#E8EDF3] bg-sportxo-white px-4 py-4 sm:px-5",
                      "shadow-[0_1px_2px_rgb(11_31_58/0.04)]",
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {provider.icon}
                      <div className="min-w-0 pr-2">
                        <p className="text-[15px] font-bold leading-tight text-[#0B1F3A]">
                          {provider.name}
                        </p>
                        <p className="mt-1 text-sm leading-snug text-[#64748B]">
                          {provider.description}
                        </p>
                      </div>
                    </div>

                    {connected ? (
                      <button
                        type="button"
                        onClick={() => onToggleConnection(provider.id)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-2 text-xs font-semibold text-[#15803D] transition-colors hover:bg-[#DCFCE7]"
                      >
                        <span
                          className="size-1.5 rounded-full bg-[#22C55E]"
                          aria-hidden
                        />
                        Connected
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleConnection(provider.id)}
                        className={cn(
                          "shrink-0 rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors",
                          "hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30",
                        )}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </SetupSectionCard>
  );
}
