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
      style={
        !selected
          ? { backgroundColor: chipTheme.unselectedChipBg }
          : undefined
      }
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-2 border-[#2563EB] bg-sportxo-white text-[#2563EB] shadow-sportxo-soft"
          : "border-sportxo-border text-[#1e293b] hover:border-[#2563EB]/35",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md border bg-sportxo-white shadow-[0_1px_2px_rgb(11_31_58/0.04)]",
          selected ? "border-[#2563EB]/20" : "border-sportxo-border/80",
        )}
        aria-hidden
      >
        <SportAssetIcon src={sport.iconSrc} alt="" size={32} className="size-8" />
      </span>
      <span
        className={cn(
          "text-sm font-semibold leading-snug",
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
