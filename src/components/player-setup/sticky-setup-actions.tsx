"use client";

import { cn } from "@/lib/cn";

type StickySetupActionsProps = {
  onSaveDraft: () => void;
  onComplete: () => void;
  isSaving?: boolean;
  isCompleting?: boolean;
};

export function StickySetupActions({
  onSaveDraft,
  onComplete,
  isSaving = false,
  isCompleting = false,
}: StickySetupActionsProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 min-w-[1280px] border-t border-sportxo-border/80 bg-sportxo-white/95 shadow-[0_-8px_30px_-12px_rgb(11_31_58_/_0.12)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-[920px] items-center justify-end gap-3 px-8 py-4">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving || isCompleting}
          className={cn(
            "inline-flex h-11 min-w-[140px] items-center justify-center rounded-full border border-sportxo-border bg-sportxo-white px-6 text-sm font-semibold text-sportxo-navy transition-colors",
            "hover:bg-sportxo-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/20 disabled:opacity-50",
          )}
        >
          {isSaving ? "Saving…" : "Save Draft"}
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={isSaving || isCompleting}
          className={cn(
            "inline-flex h-11 min-w-[160px] items-center justify-center rounded-full bg-sportxo-blue px-6 text-sm font-bold text-white transition-colors",
            "hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/30 disabled:opacity-50",
          )}
        >
          {isCompleting ? "Completing…" : "Complete Profile"}
        </button>
      </div>
    </div>
  );
}
