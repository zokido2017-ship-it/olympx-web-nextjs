"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";

type PlayerProfileWizardFooterProps = {
  step: number;
  embedded?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
  onComplete?: () => void;
  isSaving?: boolean;
  isCompleting?: boolean;
};

export function PlayerProfileWizardFooter({
  step,
  embedded = true,
  onBack,
  onContinue,
  onComplete,
  isSaving = false,
  isCompleting = false,
}: PlayerProfileWizardFooterProps) {
  const primaryClass = cn(
    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sportxo-blue px-6 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(37_99_235_/_0.8)] transition-colors sm:w-auto sm:min-w-[11rem]",
    "hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/30 disabled:opacity-50",
  );

  const secondaryClass = cn(
    "inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-sportxo-navy transition-colors sm:min-w-[8.5rem] sm:flex-none sm:gap-2 sm:px-5",
    "hover:border-[#CBD5E1] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/20 disabled:opacity-50",
  );

  const primaryLabel =
    step === 1
      ? isSaving
        ? "Saving…"
        : "Continue to Sports"
      : step === 2
        ? isSaving
          ? "Saving…"
          : "Continue to Fitness"
        : step < 3
          ? "Continue"
          : isCompleting
            ? "Completing…"
            : "Complete Profile";

  return (
    <footer
      className={cn(
        "shrink-0 border-t border-[#E8EEF5]/90 bg-white px-4 py-3 sm:px-8 sm:py-4 md:px-10 lg:px-12 xl:px-14",
        embedded && "rounded-b-2xl sm:rounded-b-[20px]",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 sm:gap-3",
          step === 1 ? "justify-end" : "justify-between",
        )}
      >
        {step > 1 ? (
          <button
            type="button"
            onClick={onBack}
            disabled={isSaving || isCompleting}
            className={secondaryClass}
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Back
          </button>
        ) : null}

        {step < 3 ? (
          <button
            type="button"
            onClick={onContinue}
            disabled={isSaving || isCompleting}
            className={primaryClass}
          >
            <span className="truncate">{primaryLabel}</span>
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            disabled={isSaving || isCompleting}
            className={primaryClass}
          >
            <span className="truncate">{primaryLabel}</span>
            <Check className="size-4 shrink-0" aria-hidden />
          </button>
        )}
      </div>
    </footer>
  );
}
