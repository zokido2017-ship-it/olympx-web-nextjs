"use client";

import * as React from "react";
import PhoneInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import type { CountryCode } from "libphonenumber-js/core";

import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

export type GlassPhoneNumberInputProps = {
  id?: string;
  disabled?: boolean;
  value: string | undefined;
  onChange(value: string | undefined): void;
  onBlur?(): void;
  "aria-invalid"?: boolean;
  className?: string;
  placeholder?: string;
  defaultCountry?: CountryCode;
  onCountryChange?(country: CountryCode | undefined): void;
};

/** International phone input with flags + formatting; tuned for glass/dark layouts via `.registration-phone-root`. */
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
  return (
    <div className={cn("registration-phone-root", className)}>
      <PhoneInput
        ref={ref}
        international
        defaultCountry={defaultCountry}
        flags={flags}
        smartCaret
        limitMaxLength
        countryCallingCodeEditable={false}
        placeholder={placeholder ?? "Enter mobile number"}
        value={value}
        onChange={onChange}
        onCountryChange={onCountryChange}
        disabled={disabled}
        numberInputProps={{
          id,
          "aria-invalid": ariaInvalid ?? false,
          onBlur,
        }}
      />
    </div>
  );
});

GlassPhoneNumberInput.displayName = "GlassPhoneNumberInput";
