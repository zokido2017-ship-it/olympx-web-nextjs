"use client";

import type { SportCategory, SportOption } from "@/constants/sports-catalog";
import { SPORT_CATEGORY_CHIP } from "@/constants/sports-catalog";
import { SportAssetIcon } from "@/components/player-setup/sport-asset-icon";
import { cn } from "@/lib/cn";

type SportSelectChipProps = {
  sport: SportOption;
  selected: boolean;
  onToggle: () => void;
};

export function SportSelectChip({
  sport,
  selected,
  onToggle,
}: SportSelectChipProps) {
  const chipTheme = SPORT_CATEGORY_CHIP[sport.category];

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={`${selected ? "Deselect" : "Select"} ${sport.name}`}
      style={
        !selected
          ? { backgroundColor: chipTheme.unselectedChipBg }
          : undefined
      }
      className={cn(
        "flex min-w-0 flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center transition-colors sm:px-3 sm:py-4",
        selected
          ? "border-2 border-[#2563EB] bg-sportxo-white text-[#2563EB] shadow-sportxo-soft"
          : "border-sportxo-border text-[#1e293b] hover:border-[#2563EB]/35",
      )}
    >
      <span
        className={cn(
          "flex size-14 shrink-0 items-center justify-center rounded-xl border bg-sportxo-white sm:size-16",
          selected ? "border-[#2563EB]/20" : "border-sportxo-border/80",
        )}
        aria-hidden
      >
        <SportAssetIcon
          src={sport.iconSrc}
          alt={sport.name}
          size={56}
          className="size-14 sm:size-16"
        />
      </span>
      <span
        className={cn(
          "w-full px-1 text-xs font-semibold leading-snug sm:text-sm",
          "line-clamp-2 break-words",
          selected ? "text-[#2563EB]" : "text-[#1e293b]",
        )}
      >
        {sport.name}
      </span>
    </button>
  );
}

export function getSportChipGridClassName(category: SportCategory) {
  return SPORT_CATEGORY_CHIP[category].gridClassName;
}
