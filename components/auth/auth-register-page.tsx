"use client";

/**
 * Registration step 1 — collect profile + send OTP, then `/register/verify-otp`.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Controller, useForm, type DefaultValues, type Resolver } from "react-hook-form";
import { isValidPhoneNumber } from "libphonenumber-js/min";
import { toast } from "sonner";

import { GlassPhoneNumberInput } from "@/components/auth/glass-phone-number-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  storeRegisterDraft,
  type OlympxRegisterDraft,
} from "@/lib/olympx/pending-registration";
import { toastAfterSendOtp } from "@/lib/olympx/toast-send-otp-result";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { splitE164ForOlympx } from "@/lib/phone-e164-parts";
import { phoneFieldValueFromForm } from "@/lib/phone-field-value";
import { olympxSendOtp } from "@/services/olympx-auth.service";
import { GENDER_OPTIONS, type Gender } from "@/types/user-profile";

const fieldShell = cn(
  "h-12 w-full rounded-xl border border-slate-200/90 bg-white px-3.5 text-slate-900 shadow-sm transition-all duration-200",
  "placeholder:text-slate-400 md:text-[15px]",
  "hover:border-slate-300/90",
  "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0",
  "dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-500",
);

const selectClasses = cn(
  "flex h-12 w-full cursor-pointer rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm transition-all duration-200 outline-none md:text-[15px]",
  "hover:border-slate-300/90 focus:border-primary focus:ring-2 focus:ring-primary/20",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100",
);

const helperText = "text-xs leading-relaxed text-slate-500 dark:text-slate-400";

function RequiredMark() {
  return (
    <abbr
      className="ml-1 cursor-help text-red-500 no-underline dark:text-red-400"
      title="Required"
    >
      *
    </abbr>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-semibold tracking-tight text-slate-900 dark:text-white"
    >
      {children}
    </label>
  );
}

function genderLabel(value: Gender) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function AuthRegisterPage() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema) as Resolver<RegistrationInput>,
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: undefined,
      contactEmail: "",
      dob: "",
      gender: "",
    } as unknown as DefaultValues<RegistrationInput>,
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = new URLSearchParams(window.location.search).get("phone");
      if (raw) {
        const decoded = decodeURIComponent(raw);
        if (isValidPhoneNumber(decoded)) {
          setValue("phone", decoded);
        }
      }
    } catch {
      /* ignore */
    }
  }, [setValue]);

  async function onSendOtp(values: RegistrationInput) {
    setBusy(true);
    try {
      const e164 = values.phone.trim();
      const parts = splitE164ForOlympx(e164);
      const sendRes = await olympxSendOtp(parts);

      const draft: OlympxRegisterDraft = {
        v: 1,
        phoneE164: e164,
        firstName: values.firstName,
        lastName: values.lastName,
        contactEmail: values.contactEmail,
        dob: values.dob,
        gender: values.gender,
      };

      storeRegisterDraft(draft);

      toastAfterSendOtp(sendRes, {
        title: "Code sent",
        description: "Enter the verification code on the next screen.",
      });
      router.push("/register/verify-otp");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send verification code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-gradient-to-b from-slate-100 via-[#eef2f4] to-slate-200/80 text-foreground dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/[0.07] blur-3xl dark:bg-primary/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-slate-300/30 blur-3xl dark:bg-slate-600/10"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
          Olympx
        </p>
        <h1 className="mt-4 text-center text-[1.75rem] font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl sm:leading-tight">
          Create account
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-center text-sm text-slate-600 dark:text-slate-400">
          Enter your details and we&apos;ll send a code to your phone.
        </p>

        <form
          className="mt-10 space-y-6 rounded-3xl border border-white/70 bg-white/90 p-7 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12)] backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.45)]"
          onSubmit={handleSubmit(onSendOtp)}
          noValidate
        >
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-5">
            <div className="space-y-0 sm:col-span-1">
              <FieldLabel htmlFor="firstName">
                First name
                <RequiredMark />
              </FieldLabel>
              <Input
                id="firstName"
                autoComplete="given-name"
                placeholder="Jane"
                className={cn(fieldShell)}
                {...register("firstName")}
                aria-invalid={Boolean(errors.firstName)}
              />
              {errors.firstName ? (
                <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.firstName.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-0 sm:col-span-1">
              <FieldLabel htmlFor="lastName">
                Last name
                <RequiredMark />
              </FieldLabel>
              <Input
                id="lastName"
                autoComplete="family-name"
                placeholder="Doe"
                className={cn(fieldShell)}
                {...register("lastName")}
                aria-invalid={Boolean(errors.lastName)}
              />
              {errors.lastName ? (
                <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                  {errors.lastName.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-0">
            <FieldLabel htmlFor="reg-phone">
              Mobile number
              <RequiredMark />
            </FieldLabel>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <GlassPhoneNumberInput
                  id="reg-phone"
                  ref={field.ref}
                  defaultCountry="IN"
                  value={phoneFieldValueFromForm(field.value)}
                  onChange={(v) =>
                    field.onChange(v === null || v === "" ? undefined : v)
                  }
                  onBlur={field.onBlur}
                  aria-invalid={Boolean(errors.phone)}
                  disabled={busy}
                  className="w-full"
                  placeholder="+91 ···"
                />
              )}
            />
            {errors.phone ? (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.phone.message}
              </p>
            ) : (
              <p className={cn("mt-2", helperText)}>Starts with India (+91). Tap the flag to change country.</p>
            )}
          </div>

          <div className="space-y-0">
            <FieldLabel htmlFor="contactEmail">
              Email
              <RequiredMark />
            </FieldLabel>
            <Input
              id="contactEmail"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={cn(fieldShell)}
              {...register("contactEmail")}
              aria-invalid={Boolean(errors.contactEmail)}
            />
            {errors.contactEmail ? (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.contactEmail.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-0">
            <FieldLabel htmlFor="dob">
              Date of birth
              <RequiredMark />
            </FieldLabel>
            <Input
              id="dob"
              type="date"
              className={cn(fieldShell)}
              {...register("dob")}
              aria-invalid={Boolean(errors.dob)}
            />
            {errors.dob ? (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.dob.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-0">
            <FieldLabel htmlFor="gender">
              Gender
              <RequiredMark />
            </FieldLabel>
            <select
              id="gender"
              className={cn(
                selectClasses,
                errors.gender && "ring-2 ring-red-400/40 dark:ring-red-500/30",
              )}
              {...register("gender")}
              aria-invalid={Boolean(errors.gender)}
            >
              <option value="" disabled>
                Select gender
              </option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {genderLabel(g)}
                </option>
              ))}
            </select>
            {errors.gender ? (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {errors.gender.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={busy}
            className="mt-2 h-12 w-full gap-2 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-[box-shadow,transform] hover:shadow-xl hover:shadow-primary/20 active:scale-[0.99] dark:shadow-primary/15"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            Send OTP
          </Button>
        </form>

        <p className="mx-auto mt-10 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have access?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
