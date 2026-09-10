"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const WIZARD_STEPS = [
  { number: 1, label: "Personal" },
  { number: 2, label: "Sports" },
  { number: 3, label: "Fitness" },
] as const;

const WIZARD_STEP_COUNT = WIZARD_STEPS.length;

type PlayerProfileWizardStepperProps = {
  currentStep: number;
};

export function PlayerProfileWizardStepper({
  currentStep,
}: PlayerProfileWizardStepperProps) {
  const progress = (currentStep / WIZARD_STEP_COUNT) * 100;
  const current = WIZARD_STEPS[currentStep - 1];

  return (
    <div className="shrink-0 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-sportxo-navy">
          Step {currentStep} of {WIZARD_STEP_COUNT}
        </p>
        <p className="text-sm font-semibold text-sportxo-blue">
          {current?.label}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {WIZARD_STEPS.map((step) => {
          const isActive = step.number === currentStep;
          const isComplete = step.number < currentStep;

          return (
            <div key={step.number} className="min-w-0 text-center">
              <div
                className={cn(
                  "mx-auto flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isActive
                    ? "bg-sportxo-blue text-white"
                    : isComplete
                      ? "bg-[#DBEAFE] text-sportxo-blue"
                      : "bg-[#E8EEF5] text-[#94A3B8]",
                )}
              >
                {step.number}
              </div>
              <p
                className={cn(
                  "mt-1 truncate text-[11px] font-semibold sm:text-xs",
                  isActive
                    ? "text-sportxo-blue"
                    : isComplete
                      ? "text-sportxo-navy"
                      : "text-[#94A3B8]",
                )}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-[#E8EEF5]"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Profile setup progress, step ${currentStep} of ${WIZARD_STEP_COUNT}`}
      >
        <motion.div
          className="h-full rounded-full bg-sportxo-blue"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
        />
      </div>
    </div>
  );
}
