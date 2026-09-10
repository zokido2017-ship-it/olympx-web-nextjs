"use client";

import { useMemo, useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import {
  SPORT_CATEGORY_META,
  SPORT_CATEGORY_ORDER,
  type SportCategory,
  type SportOption,
} from "@/constants/sports-catalog";
import { SetupSectionCard } from "@/components/player-setup/setup-section-card";
import {
  getSportChipGridClassName,
  SportSelectChip,
} from "@/components/player-setup/sport-select-chip";
import { SportAssetIcon } from "@/components/player-setup/sport-asset-icon";
import { cn } from "@/lib/cn";

const wizardPanelClass =
  "border-0 bg-transparent p-0 shadow-none ring-0";

type SportsInformationSectionProps = {
  sports: SportOption[];
  selectedSportIds: string[];
  onToggleSport: (sportId: string) => void;
  wizardMode?: boolean;
  isLoading?: boolean;
  loadError?: string | null;
  usingFallbackCatalog?: boolean;
};

export function SportsInformationSection({
  sports,
  selectedSportIds,
  onToggleSport,
  wizardMode = false,
  isLoading = false,
  loadError = null,
  usingFallbackCatalog = false,
}: SportsInformationSectionProps) {
  const [query, setQuery] = useState("");

  const filteredByCategory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return SPORT_CATEGORY_ORDER.map((category) => ({
      category,
      meta: SPORT_CATEGORY_META[category],
      sports: sports.filter((sport) => {
        if (sport.category !== category) return false;
        if (!normalizedQuery) return true;
        return sport.name.toLowerCase().includes(normalizedQuery);
      }),
    })).filter((group) => group.sports.length > 0);
  }, [query, sports]);

  const selectedSports = useMemo(
    () => sports.filter((sport) => selectedSportIds.includes(sport.id)),
    [sports, selectedSportIds],
  );

  const selectedByCategory = useMemo(() => {
    return SPORT_CATEGORY_ORDER.map((category) => ({
      category,
      meta: SPORT_CATEGORY_META[category],
      sports: selectedSports.filter((sport) => sport.category === category),
    })).filter((group) => group.sports.length > 0);
  }, [selectedSports]);

  return (
    <SetupSectionCard
      step={wizardMode ? undefined : "Section 2"}
      title={wizardMode ? undefined : "Sports Selection"}
      hideHeader={wizardMode}
      className={wizardMode ? wizardPanelClass : undefined}
    >
      <div className={cn("space-y-8", wizardMode && "w-full space-y-4")}>
        {wizardMode ? (
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-sportxo-navy">Sports Selection</h2>
            <p className="text-sm text-sportxo-text-muted">
              Choose the sports you play. Icons and IDs are loaded from the Sportxo
              sports API.
            </p>
            {usingFallbackCatalog ? (
              <p className="text-xs font-medium text-amber-700">
                Showing offline sport list because the sports API could not be loaded.
              </p>
            ) : null}
            {loadError ? (
              <p className="text-xs font-medium text-red-600">{loadError}</p>
            ) : null}
          </div>
        ) : null}

        <div className="relative">
          <HiMagnifyingGlass
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-sportxo-text-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search sports"
            className="h-11 w-full rounded-lg border border-sportxo-border bg-[#F8FAFC] py-2 pl-10 pr-4 text-sm text-sportxo-navy outline-none transition-colors placeholder:text-[#94A3B8] focus:border-sportxo-blue focus:bg-sportxo-white focus:ring-2 focus:ring-sportxo-blue/15"
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-sportxo-text-muted">Loading sports…</p>
        ) : filteredByCategory.length === 0 ? (
          <p className="text-sm text-sportxo-text-muted">
            No sports match your search.
          </p>
        ) : (
          filteredByCategory.map((group, index) => {
            const CategoryIcon = group.meta.icon;

            return (
              <div key={group.category}>
                {index > 0 ? (
                  <div className="mb-8 border-t border-sportxo-border/70" />
                ) : null}

                <div className="mb-4 flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-sportxo-blue">
                    <CategoryIcon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-sportxo-navy">
                      {group.meta.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-sportxo-text-muted">
                      {group.meta.subtitle}
                    </p>
                  </div>
                </div>

                <div className={getSportChipGridClassName(group.category)}>
                  {group.sports.map((sport) => (
                    <SportSelectChip
                      key={sport.id}
                      sport={sport}
                      selected={selectedSportIds.includes(sport.id)}
                      onToggle={() => onToggleSport(sport.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}

        <div className="rounded-xl border border-sportxo-border/70 bg-[#F8FAFC] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-sportxo-text-muted">
            Selected sports
          </p>
          {selectedByCategory.length === 0 ? (
            <p className="mt-2 text-sm text-sportxo-text-muted">
              No sports selected yet.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {selectedByCategory.map((group) => (
                <div key={group.category}>
                  <p className="text-xs font-semibold text-sportxo-blue">
                    {group.meta.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {group.sports.map((sport) => (
                      <span
                        key={sport.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-sportxo-border px-2.5 py-1.5 text-xs font-semibold text-[#1e293b] shadow-sportxo-soft"
                        style={{
                          backgroundColor:
                            sport.category === "indoor" ? "#F8F9FC" : "#FFFFFF",
                        }}
                      >
                        <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md border border-sportxo-border/90 bg-sportxo-white">
                          <SportAssetIcon src={sport.iconSrc} alt="" size={24} />
                        </span>
                        {sport.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SetupSectionCard>
  );
}
