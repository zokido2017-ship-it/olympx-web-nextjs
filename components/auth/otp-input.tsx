"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Accessible OTP input (digits only) with focus advance and paste support.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
  className,
}: OtpInputProps) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const clean = value.replace(/\D/g, "").slice(0, length);
  const chars = Array.from({ length }, (_, i) => clean[i] ?? "");

  const focusAt = (idx: number) => {
    const el = inputsRef.current[idx];
    queueMicrotask(() => {
      el?.focus();
      el?.select();
    });
  };

  return (
    <div className={cn("flex justify-center gap-2 sm:gap-3", className)}>
      {chars.map((ch, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputsRef.current[idx] = el;
          }}
          inputMode="numeric"
          autoComplete={idx === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={ch}
          aria-label={`Digit ${idx + 1} of ${length}`}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, "").slice(-1);
            const base = [...chars];
            base[idx] = digit;
            onChange(base.join("").replace(/\D/g, ""));
            if (digit && idx < length - 1) focusAt(idx + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              if (chars[idx]) {
                const base = [...chars];
                base[idx] = "";
                onChange(base.join(""));
                return;
              }
              if (idx > 0) {
                const base = [...chars];
                base[idx - 1] = "";
                onChange(base.join(""));
                focusAt(idx - 1);
              }
            }
            if (e.key === "ArrowLeft" && idx > 0) focusAt(idx - 1);
            if (e.key === "ArrowRight" && idx < length - 1) focusAt(idx + 1);
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            const digits = text.replace(/\D/g, "").slice(0, length);
            if (!digits) return;
            e.preventDefault();
            onChange(digits);
            focusAt(Math.min(digits.length, length - 1));
          }}
          className="h-12 w-11 rounded-md bg-muted text-center text-lg font-semibold tracking-widest text-foreground ring-ghost outline-none transition-[background-color,box-shadow] focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary/35 sm:h-14 sm:w-12 sm:text-xl"
        />
      ))}
    </div>
  );
}
