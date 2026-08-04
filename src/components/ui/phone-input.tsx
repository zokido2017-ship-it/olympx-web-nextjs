"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { HiChevronDown } from "react-icons/hi2";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  type PhoneCountry,
} from "@/constants/phone-countries";
import { cn } from "@/lib/cn";

export type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  error?: boolean;
  countryCode?: string;
  onCountryCodeChange?: (dialCode: string) => void;
};

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      className,
      error,
      countryCode = DEFAULT_PHONE_COUNTRY.dialCode,
      onCountryCodeChange,
      id,
      placeholder = "Phone Number",
      ...props
    },
    ref,
  ) => {
    const listId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const selected =
      PHONE_COUNTRIES.find((c) => c.dialCode === countryCode) ??
      DEFAULT_PHONE_COUNTRY;

    useEffect(() => {
      if (!open) return;

      const onPointerDown = (event: MouseEvent) => {
        if (!rootRef.current?.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", onPointerDown);
      return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open]);

    const selectCountry = (country: PhoneCountry) => {
      onCountryCodeChange?.(country.dialCode);
      setOpen(false);
    };

    return (
      <div ref={rootRef} className="relative">
        <div
          className={cn(
            "flex h-12 w-full items-center overflow-hidden rounded-full border bg-[#F3F5F9] transition-colors",
            "border-transparent focus-within:border-sportxo-blue/30 focus-within:bg-sportxo-white focus-within:ring-2 focus-within:ring-sportxo-blue/15",
            error &&
              "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/15",
            className,
          )}
        >
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((value) => !value)}
            className="flex h-full shrink-0 items-center gap-1.5 pl-4 pr-2.5 text-sm font-medium text-sportxo-navy transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sportxo-blue/25"
          >
            <span className="text-base leading-none" aria-hidden>
              {selected.flag}
            </span>
            <span>{selected.dialCode}</span>
            <HiChevronDown
              className={cn(
                "size-4 text-[#64748B] transition-transform",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          <span
            className="h-5 w-px shrink-0 bg-[#E2E8F0]"
            aria-hidden
          />

          <input
            ref={ref}
            id={id}
            type="tel"
            autoComplete="tel-national"
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent py-2 pl-3 pr-4 text-sm font-medium text-sportxo-navy outline-none placeholder:font-normal placeholder:text-[#94A3B8]"
            {...props}
          />
        </div>

        {open ? (
          <ul
            id={listId}
            role="listbox"
            aria-label="Country code"
            className="absolute left-0 top-[calc(100%+0.5rem)] z-20 max-h-52 w-full overflow-auto rounded-2xl border border-[#E2E8F0] bg-sportxo-white p-1.5 shadow-sportxo-card"
          >
            {PHONE_COUNTRIES.map((country) => {
              const active = country.dialCode === selected.dialCode;
              return (
                <li key={country.iso} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => selectCountry(country)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                      active
                        ? "bg-[#F3F5F9] font-semibold text-sportxo-navy"
                        : "text-sportxo-navy hover:bg-[#F8FAFC]",
                    )}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {country.flag}
                    </span>
                    <span className="font-medium">{country.dialCode}</span>
                    <span className="truncate text-[#64748B]">
                      {country.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";
