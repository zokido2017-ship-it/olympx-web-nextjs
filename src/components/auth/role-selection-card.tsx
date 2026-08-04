"use client";

import { cn } from "@/lib/cn";
import type { SportxoRoleOption } from "@/constants/sportxo-roles";

type RoleSelectionCardProps = {
  role: SportxoRoleOption;
  selected: boolean;
  onSelect: () => void;
};

export function RoleSelectionCard({
  role,
  selected,
  onSelect,
}: RoleSelectionCardProps) {
  const Icon = role.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all",
        "border-[#E2E8F0] bg-[#F8FAFC] hover:border-sportxo-blue/35 hover:bg-sportxo-white hover:shadow-sportxo-soft",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/25",
        selected &&
          "border-sportxo-blue bg-sportxo-white shadow-sportxo-soft ring-2 ring-sportxo-blue/15",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
          selected
            ? "bg-sportxo-blue text-white"
            : "bg-[#EEF2FF] text-sportxo-blue",
        )}
        aria-hidden
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 pt-0.5">
        <span className="block text-sm font-bold text-sportxo-navy">
          {role.title}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-[#64748B]">
          {role.description}
        </span>
      </span>
    </button>
  );
}
