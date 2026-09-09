"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type WizardSelectFieldProps = {
  id?: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

export function WizardSelectField({
  id,
  icon: Icon,
  value,
  onChange,
  placeholder = "Select an option",
  children,
  className,
  "aria-label": ariaLabel,
}: WizardSelectFieldProps) {
  return (
    <div className={cn("relative w-full min-w-0 max-w-full", className)}>
      <Icon
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]"
        aria-hidden
      />
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]"
        aria-hidden
      />
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        className={cn(
          "h-11 w-full min-w-0 max-w-full appearance-none rounded-xl border border-[#E8EEF5] bg-[#F8FAFC]/80 pl-10 pr-10 text-sm text-sportxo-navy shadow-none outline-none transition-all",
          "hover:border-[#CBD5E1] hover:bg-white",
          "focus:border-sportxo-blue/40 focus:bg-white focus:ring-2 focus:ring-sportxo-blue/15",
          !value && "text-[#94A3B8]",
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
    </div>
  );
}
