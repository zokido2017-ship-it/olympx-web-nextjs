"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/cn";

export type OtpInputGroupProps = {
  length?: number;
  value: string[];
  onChange: (digits: string[]) => void;
  onComplete?: (otp: string) => void;
  error?: boolean;
  disabled?: boolean;
  className?: string;
};

export type OtpInputGroupHandle = {
  focus: (index?: number) => void;
};

export const OtpInputGroup = forwardRef<OtpInputGroupHandle, OtpInputGroupProps>(
  function OtpInputGroup(
    {
      length = 4,
      value,
      onChange,
      onComplete,
      error = false,
      disabled = false,
      className,
    },
    ref,
  ) {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useImperativeHandle(ref, () => ({
      focus: (index = 0) => {
        inputRefs.current[index]?.focus();
      },
    }));

    const focusIndex = (index: number) => {
      inputRefs.current[index]?.focus();
    };

    const updateDigit = (index: number, raw: string) => {
      const next = raw.replace(/\D/g, "").slice(-1);
      const copy = [...value];
      copy[index] = next;
      onChange(copy);

      if (next && index < length - 1) {
        focusIndex(index + 1);
      }

      const otp = copy.join("");
      if (otp.length === length && /^\d+$/.test(otp)) {
        onComplete?.(otp);
      }
    };

    return (
      <div
        className={cn("flex justify-center gap-2 sm:gap-3", className)}
        role="group"
        aria-label="One-time password digits"
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={value[index] ?? ""}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Backspace" || value[index]) return;
              if (index > 0) {
                event.preventDefault();
                const copy = [...value];
                copy[index - 1] = "";
                onChange(copy);
                focusIndex(index - 1);
              }
            }}
            onPaste={(event) => {
              event.preventDefault();
              const pasted = event.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, length);
              if (!pasted) return;
              const copy = Array.from({ length }, (_, i) => pasted[i] ?? "");
              onChange(copy);
              focusIndex(Math.min(pasted.length, length - 1));
              if (pasted.length === length) {
                onComplete?.(pasted);
              }
            }}
            className={cn(
              "size-14 min-w-0 flex-1 max-w-[4.25rem] rounded-2xl border-2 bg-[#F8FAFC] text-center text-xl font-bold text-sportxo-navy outline-none transition-all sm:size-16 sm:max-w-[4.75rem] sm:text-2xl",
              "border-transparent focus:border-sportxo-blue focus:bg-white focus:ring-4 focus:ring-sportxo-blue/15",
              error && "border-red-400 focus:border-red-500 focus:ring-red-500/15",
              disabled && "opacity-60",
            )}
          />
        ))}
      </div>
    );
  },
);
