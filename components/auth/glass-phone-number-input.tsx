"use client";

import * as React from "react";
import PhoneInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import type { CountryCode } from "libphonenumber-js/core";

import "react-phone-number-input/style.css";
import { useIsClientReady } from "@/hooks/use-is-client-ready";
import { cn } from "@/lib/utils";

/** Package typings still describe a class; `createPhoneInput()` is `forwardRef` → `<input>`. */
type PhoneInputPkgProps = React.ComponentProps<typeof PhoneInput>;
const PhoneInputWithInputRef = PhoneInput as unknown as React.ForwardRefExoticComponent<
  Omit<PhoneInputPkgProps, "ref"> & React.RefAttributes<HTMLInputElement>
>;

export type GlassPhoneNumberInputProps = {
  id?: string;
  disabled?: boolean;
  /** E.164 or empty; use `undefined` for “no value” — never `null` (keeps PhoneInput controlled & avoids RHF quirks). */
  value: string | undefined;
  onChange(value: string | undefined): void;
  onBlur?(): void;
  "aria-invalid"?: boolean;
  className?: string;
  placeholder?: string;
  defaultCountry?: CountryCode;
  onCountryChange?(country: CountryCode | undefined): void;
};

/** International phone input with flags + formatting; styled via `.registration-phone-root`. */
export const GlassPhoneNumberInput = React.forwardRef<
  HTMLInputElement,
  GlassPhoneNumberInputProps
>(function GlassPhoneNumberInput(
  {
    id,
    disabled,
    value,
    onChange,
    onBlur,
    "aria-invalid": ariaInvalid,
    className,
    placeholder,
    defaultCountry = "US",
    onCountryChange,
  },
  ref,
) {
  const clientReady = useIsClientReady();
  const phoneValue =
    value === null || value === undefined || value === ""
      ? undefined
      : value;

  const handleChange = React.useCallback(
    (next: string | undefined) => {
      onChange(next === null || next === "" ? undefined : next);
    },
    [onChange],
  );

  const numberInputProps = React.useMemo(
    () => ({
      id,
      "aria-invalid": ariaInvalid ?? false,
      onBlur,
    }),
    [id, ariaInvalid, onBlur],
  );

  /** Library focuses the input synchronously on country pick; that can run before refs are ready. Defer safe focus instead. */
  const handleCountryChange = React.useCallback(
    (country: CountryCode | undefined) => {
      onCountryChange?.(country);
      if (!id) return;
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el instanceof HTMLInputElement && !el.disabled) {
          el.focus();
        }
      });
    },
    [onCountryChange, id],
  );

  if (!clientReady) {
    return (
      <div className={cn("registration-phone-root", className)}>
        <div className="PhoneInput flex min-w-0 flex-nowrap items-stretch gap-2">
          <div
            className="flex min-h-11 w-[4.25rem] shrink-0 items-center justify-center self-stretch rounded-md shadow-[0_0_0_1px_var(--ghost-ring)] md:min-h-12"
            style={{
              background: "var(--registration-country-bg, var(--muted))",
            }}
            aria-hidden
          />
          <input
            id={id}
            ref={ref}
            type="tel"
            autoComplete="tel-national"
            disabled={disabled}
            readOnly
            aria-invalid={ariaInvalid ?? false}
            placeholder={placeholder ?? "Enter mobile number"}
            onBlur={onBlur}
            className="PhoneInputInput min-h-11 min-w-0 flex-1 md:min-h-12"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("registration-phone-root", className)}>
      {/*
        Forward `ref` on `<PhoneInput />`, not inside `numberInputProps`.
        `numberInputProps.ref` overrides the library's `setInputRef` merge callback,
        so the internal input ref never mounts → CountrySelect crashes on `.focus()`.
      */}
      <PhoneInputWithInputRef
        ref={ref}
        international
        defaultCountry={defaultCountry}
        flags={flags}
        smartCaret
        limitMaxLength
        focusInputOnCountrySelection={false}
        placeholder={placeholder ?? "Enter mobile number"}
        value={phoneValue}
        onChange={handleChange}
        onCountryChange={handleCountryChange}
        disabled={disabled}
        numberInputProps={numberInputProps}
      />
    </div>
  );
});

GlassPhoneNumberInput.displayName = "GlassPhoneNumberInput";
