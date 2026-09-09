"use client";

import type { LucideIcon } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type WizardIconFieldProps = InputProps & {
  icon: LucideIcon;
  wrapperClassName?: string;
};

export function WizardIconField({
  icon: Icon,
  className,
  wrapperClassName,
  ...props
}: WizardIconFieldProps) {
  return (
    <div className={cn("relative w-full min-w-0 max-w-full", wrapperClassName)}>
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]"
        aria-hidden
      />
      <Input
        {...props}
        className={cn(
          "h-11 w-full min-w-0 max-w-full rounded-xl border-[#E8EEF5] bg-[#F8FAFC]/80 pl-10 shadow-none transition-all",
          "hover:border-[#CBD5E1] hover:bg-white",
          "focus:border-sportxo-blue/40 focus:bg-white focus:ring-2 focus:ring-sportxo-blue/15",
          className,
        )}
      />
    </div>
  );
}
