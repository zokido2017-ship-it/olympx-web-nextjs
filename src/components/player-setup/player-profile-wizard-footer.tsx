"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";

type PlayerProfileWizardFooterProps = {
  step: number;
  embedded?: boolean;
  onBack?: () => void;
  onSaveDraft?: () => void;
  onContinue?: () => void;
  onComplete?: () => void;
  isSaving?: boolean;
  isCompleting?: boolean;
};

export function PlayerProfileWizardFooter({
  step,
  embedded = true,
  onBack,
  onSaveDraft,
  onContinue,
  onComplete,
  isSaving = false,
  isCompleting = false,
}: PlayerProfileWizardFooterProps) {
  const primaryClass = cn(
    "inline-flex h-11 min-w-[13.25rem] items-center justify-center gap-2 rounded-xl bg-sportxo-blue px-6 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(37_99_235_/_0.8)] transition-colors",
    "hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/30 disabled:opacity-50",
  );

  const secondaryClass = cn(
    "inline-flex h-11 min-w-[9.5rem] items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-sportxo-navy transition-colors",
    "hover:border-[#CBD5E1] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/20 disabled:opacity-50",
  );

  const primaryLabel =
    step === 2
      ? "Continue to Fitness"
      : step < 3
        ? "Continue"
        : isCompleting
          ? "Completing…"
          : "Complete Profile";

  return (
    <footer
      className={cn(
        "shrink-0 border-t border-[#E8EEF5]/90 bg-white/90 px-5 py-4 backdrop-blur-md sm:px-8 md:px-10 lg:px-12 xl:px-14",
        embedded && "rounded-b-[20px]",
      )}
    >
      <div className="flex min-h-11 items-center justify-between gap-3">
        <div className="flex min-h-11 min-w-[9.5rem] items-center">
          {step === 1 ? (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving || isCompleting}
              className="inline-flex h-11 min-w-[9.5rem] items-center justify-start rounded-lg px-2 text-sm font-semibold text-sportxo-blue transition-colors hover:bg-[#EFF6FF] hover:text-[#1d4ed8] disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save Draft"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onBack}
              disabled={isSaving || isCompleting}
              className={secondaryClass}
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              Back
            </button>
          )}
        </div>

        <div className="flex min-h-11 items-center justify-end">
          {step < 3 ? (
            <button
              type="button"
              onClick={onContinue}
              disabled={isSaving || isCompleting}
              className={primaryClass}
            >
              <span>{primaryLabel}</span>
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              disabled={isSaving || isCompleting}
              className={primaryClass}
            >
              <span>{primaryLabel}</span>
              <Check className="size-4 shrink-0" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
