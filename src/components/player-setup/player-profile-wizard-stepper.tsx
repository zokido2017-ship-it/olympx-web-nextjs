"use client";

import { motion } from "framer-motion";

const WIZARD_STEP_COUNT = 3;

type PlayerProfileWizardStepperProps = {
  currentStep: number;
};

export function PlayerProfileWizardStepper({
  currentStep,
}: PlayerProfileWizardStepperProps) {
  const progress = (currentStep / WIZARD_STEP_COUNT) * 100;

  return (
    <div className="shrink-0 space-y-2 sm:space-y-3">
      <p className="text-sm font-medium text-sportxo-navy">
        Step {currentStep} of {WIZARD_STEP_COUNT}
      </p>

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
