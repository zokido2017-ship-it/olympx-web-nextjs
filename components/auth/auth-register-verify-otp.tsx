"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { authDebug } from "@/lib/olympx/auth-debug";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/olympx/default-post-login";
import {
  persistDashboardUserFromRegistration,
} from "@/lib/dashboard-user-storage";
import {
  clearPendingRegistrationAvatar,
  fileFromPendingAvatar,
  readPendingRegistrationAvatar,
} from "@/lib/olympx/pending-registration-avatar";
import {
  clearRegisterDraft,
  readRegisterDraft,
  type OlympxRegisterDraft,
} from "@/lib/olympx/pending-registration";
import {
  getOlympxTokenFromAuth,
  persistOlympxAuthResponse,
  type OlympxAuthResponse,
} from "@/lib/olympx/session";
import { syncOlympxSessionToServer } from "@/lib/olympx/sync-server-session";
import { toastAfterSendOtp } from "@/lib/olympx/toast-send-otp-result";
import {
  registrationOtpSchema,
  type RegistrationOtpInput,
} from "@/lib/validations/auth";
import { useOlympxAuth } from "@/hooks/use-olympx-auth";
import { registrationFieldsFromE164 } from "@/lib/phone-e164-parts";
import {
  isOlympxHttpError,
  olympxLoginWithOtp,
  olympxRegister,
  olympxSendOtp,
  registerLooksLikeDuplicate,
} from "@/services/olympx-auth.service";
import { PHONE_OTP_DIGIT_COUNT } from "@/types/auth";

const RESEND_COOLDOWN_SEC = 60;

export function AuthRegisterVerifyOtpPage() {
  const router = useRouter();
  const { applyAuthResponse } = useOlympxAuth();
  const [draft, setDraft] = React.useState<OlympxRegisterDraft | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [otpSending, setOtpSending] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationOtpInput>({
    resolver: zodResolver(registrationOtpSchema) as Resolver<RegistrationOtpInput>,
    defaultValues: { otp: "" },
  });

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  React.useEffect(() => {
    const d = readRegisterDraft();
    if (!d) {
      router.replace("/register");
      return;
    }
    queueMicrotask(() => {
      setDraft(d);
    });
  }, [router]);

  const sendAgain = React.useCallback(async () => {
    if (!draft) return;
    setOtpSending(true);
    try {
      const parts = registrationFieldsFromE164(draft.phoneE164);
      const sendRes = await olympxSendOtp(parts);
      toastAfterSendOtp(sendRes, {
        title: "Code sent",
        description: "Check your phone for a new verification code.",
      });
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not resend code.");
    } finally {
      setOtpSending(false);
    }
  }, [draft]);

  async function onVerify({ otp }: RegistrationOtpInput) {
    if (!draft) return;
    setBusy(true);
    try {
      const parts = registrationFieldsFromE164(draft.phoneE164);

      const pendingAvatar = readPendingRegistrationAvatar();
      const profilePhoto = pendingAvatar
        ? fileFromPendingAvatar(pendingAvatar)
        : null;

      let sessionPayload: OlympxAuthResponse = await olympxRegister({
        firstName: draft.firstName,
        lastName: draft.lastName,
        mobile: draft.phoneE164,
        email: draft.contactEmail,
        dateOfBirth: draft.dob,
        gender: draft.gender,
        otp,
        profileImage: profilePhoto ?? undefined,
      });

      let token = getOlympxTokenFromAuth(sessionPayload);
      if (!token) {
        try {
          sessionPayload = await olympxLoginWithOtp(parts, otp);
          token = getOlympxTokenFromAuth(sessionPayload);
        } catch (e) {
          authDebug("otp-api", "register: validate-otp fallback failed", {
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }

      if (!token) {
        toast.error("Could not start a session after registration.", {
          description: "Try signing in with this phone number.",
        });
        router.replace(`/login?phone=${encodeURIComponent(draft.phoneE164)}`);
        return;
      }

      persistDashboardUserFromRegistration(
        draft,
        pendingAvatar?.dataUrl ?? null,
      );
      clearRegisterDraft();
      clearPendingRegistrationAvatar();
      persistOlympxAuthResponse(sessionPayload);
      const synced = await syncOlympxSessionToServer(token);
      applyAuthResponse(sessionPayload);
      if (!synced) {
        toast.message("Session cookie sync delayed", {
          description: "If the dashboard does not load, sign in again.",
        });
      }
      toast.success("Welcome to Olympx", {
        description: "Your account is ready.",
      });
      window.location.assign(DEFAULT_POST_LOGIN_PATH);
    } catch (e) {
      if (isOlympxHttpError(e) && registerLooksLikeDuplicate(e)) {
        toast.error("Account may already exist", {
          description: "Try signing in with this phone number instead.",
        });
        clearRegisterDraft();
        window.setTimeout(
          () =>
            router.replace(
              `/login?phone=${encodeURIComponent(draft.phoneE164)}`,
            ),
          400,
        );
        return;
      }
      toast.error(e instanceof Error ? e.message : "Registration failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function onEditDetails() {
    clearRegisterDraft();
    clearPendingRegistrationAvatar();
    router.replace("/register");
  }

  if (!draft) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-slate-100 via-[#eef2f4] to-slate-200/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" aria-hidden />
      </div>
    );
  }

  const last4 = draft.phoneE164.replace(/\D/g, "").slice(-4);
  const masked =
    last4.length > 0 ? `the number ending in ${last4}` : "your number";

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
          Verify your number
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Enter the {PHONE_OTP_DIGIT_COUNT}-digit code we sent to{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{masked}</span>.
        </p>

        <form
          className="mt-10 space-y-6 rounded-3xl border border-white/70 bg-white/90 p-7 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12)] backdrop-blur-md sm:p-8 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.45)]"
          onSubmit={handleSubmit(onVerify)}
          noValidate
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-mt-1 -ml-2 gap-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onEditDetails}
            disabled={busy}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Edit details
          </Button>

          <div className="space-y-3.5">
            <label className="mb-0 block text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Verification code<span className="ml-1 text-red-500 dark:text-red-400">*</span>
            </label>
            <Controller
              name="otp"
              control={control}
              render={({ field }) => (
                <OtpInput
                  length={PHONE_OTP_DIGIT_COUNT}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={busy}
                />
              )}
            />
            {errors.otp ? (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                {errors.otp.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-11 rounded-xl border-slate-200/90 bg-white/80 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/15 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/10"
              disabled={busy || otpSending || cooldown > 0}
              onClick={() => void sendAgain()}
            >
              {otpSending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
            </Button>
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={busy}
            className="h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-[box-shadow,transform] hover:shadow-xl hover:shadow-primary/20 active:scale-[0.99] dark:shadow-primary/15"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
            Verify and create account
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
