"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import { LOGIN_PHONE_STORAGE_KEY, type StoredLoginPhone } from "@/types/auth";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { createDefaultOtpDigits, DEFAULT_OTP, isDevOtpEnabled } from "@/lib/auth-otp";
import { parseSendOtpFlags } from "@/lib/auth-otp-flags";
import { navigateAfterPhoneOtpAuth } from "@/lib/auth-navigation";
import { dialCodeToPhoneCode, normalizeMobileNumber } from "@/lib/phone";
import {
  safeSessionGetItem,
  safeSessionRemoveItem,
  safeSessionSetItem,
} from "@/lib/safe-storage";
import { sendOtp } from "@/services/auth-api.service";
import { completePhoneOtpVerification } from "@/services/phone-auth.service";
import { FieldError } from "@/components/ui/field-error";
import { OtpInputGroup, type OtpInputGroupHandle } from "@/components/ui/otp-input-group";

const OTP_LENGTH = 4;
const RESEND_COOLDOWN_SECONDS = 60;

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function OtpVerificationForm() {
  const router = useRouter();
  const otpRef = useRef<OtpInputGroupHandle>(null);
  const [digits, setDigits] = useState<string[]>(() =>
    createDefaultOtpDigits(OTP_LENGTH),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneLabel, setPhoneLabel] = useState<string | null>(null);
  const [phoneSession, setPhoneSession] = useState<StoredLoginPhone | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const raw = safeSessionGetItem(LOGIN_PHONE_STORAGE_KEY);
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as StoredLoginPhone;
      const phone_code =
        parsed.phone_code ?? dialCodeToPhoneCode(parsed.countryCode);
      const mobile_number =
        parsed.mobile_number ?? normalizeMobileNumber(parsed.phoneNumber);

      if (!phone_code || !mobile_number) {
        router.replace("/login");
        return;
      }

      setPhoneSession({
        ...parsed,
        phone_code,
        mobile_number,
      });
      setPhoneLabel(`${parsed.countryCode} ${parsed.phoneNumber}`);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [secondsLeft]);

  const otpValue = digits.join("");

  const submitOtp = useCallback(
    async (code: string) => {
      if (!/^\d{4}$/.test(code) || !phoneSession?.phone_code || !phoneSession.mobile_number || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setError(null);
      try {
        if (!phoneSession.registered) {
          setError("No account found with this number. Please create an account.");
          return;
        }

        const result = await completePhoneOtpVerification({
          otpPayload: {
            phone_code: phoneSession.phone_code,
            mobile_number: phoneSession.mobile_number,
            otp: code,
          },
          registered: true,
          playerExists: Boolean(phoneSession.player_exists),
        });

        if (result.mode !== "login") {
          setError("No account found with this number. Please create an account.");
          return;
        }

        safeSessionRemoveItem(LOGIN_PHONE_STORAGE_KEY);
        toast.success(
          result.mode === "login" ? "Signed in successfully" : "Account created",
        );
        navigateAfterPhoneOtpAuth(router, {
          playerExists: result.playerExists,
        });
      } catch (submitError) {
        setError(getApiErrorMessage(submitError, "Invalid OTP. Please try again."));
        otpRef.current?.focus(0);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, phoneSession, router],
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{4}$/.test(otpValue)) {
      setError("Enter the 4-digit OTP");
      otpRef.current?.focus(0);
      return;
    }
    await submitOtp(otpValue);
  };

  const onResend = useCallback(async () => {
    if (secondsLeft > 0 || isResending || !phoneSession?.phone_code || !phoneSession.mobile_number) {
      return;
    }

    setIsResending(true);
    try {
      const sendOtpResponse = await sendOtp({
        phone_code: phoneSession.phone_code,
        mobile_number: phoneSession.mobile_number,
      });
      const { registered, playerExists } = parseSendOtpFlags(sendOtpResponse);

      safeSessionSetItem(
        LOGIN_PHONE_STORAGE_KEY,
        JSON.stringify({
          ...phoneSession,
          registered,
          player_exists: playerExists,
        }),
      );
      setPhoneSession((current) =>
        current
          ? { ...current, registered, player_exists: playerExists }
          : current,
      );

      setDigits(createDefaultOtpDigits(OTP_LENGTH));
      setError(null);
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
      otpRef.current?.focus(0);
      toast.success("OTP sent again");
    } catch (resendError) {
      toast.error(
        getApiErrorMessage(resendError, "Could not resend OTP. Please try again."),
      );
    } finally {
      setIsResending(false);
    }
  }, [isResending, phoneSession, secondsLeft]);

  if (phoneLabel === null) {
    return (
      <div className="py-10 text-center text-sm text-sportxo-text-muted">
        Loading…
      </div>
    );
  }

  const canResend = secondsLeft <= 0 && !isResending;
  const isRegistered = Boolean(phoneSession?.registered);

  return (
    <div className="space-y-4 sm:space-y-5">
      <p className="text-center text-sm leading-relaxed text-sportxo-text-muted sm:text-[0.9375rem]">
        Enter the 4-digit code sent to{" "}
        <span className="font-semibold text-sportxo-navy">{phoneLabel}</span>
      </p>
      <p className="text-center text-xs text-sportxo-text-muted">
        {isRegistered
          ? "This number is registered. We will sign you in after verification."
          : "This number is new. We will create your account after verification."}
      </p>

      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5" noValidate>
        <div className="space-y-4">
          <OtpInputGroup
            ref={otpRef}
            value={digits}
            onChange={(next) => {
              setDigits(next);
              setError(null);
            }}
            onComplete={(code) => void submitOtp(code)}
            error={Boolean(error)}
            disabled={isSubmitting}
          />
          <FieldError message={error ?? undefined} />
          {isDevOtpEnabled() ? (
            <p className="text-center text-xs text-sportxo-text-muted">
              Dev OTP: <span className="font-semibold text-sportxo-navy">{DEFAULT_OTP}</span>
            </p>
          ) : null}
        </div>

        <AuthPrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Verifying…"
            : isRegistered
              ? "Verify & Sign In"
              : "Verify & Create Account"}
        </AuthPrimaryButton>
      </form>

      <div className="space-y-3 text-center text-sm text-sportxo-text-muted">
        <p>
          {canResend ? (
            <>
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={onResend}
                className="font-bold text-sportxo-blue transition-colors hover:text-[#1d4ed8]"
              >
                Resend OTP
              </button>
            </>
          ) : (
            <>
              Resend in{" "}
              <span className="font-semibold tabular-nums text-sportxo-navy">
                {formatCountdown(secondsLeft)}
              </span>
            </>
          )}
        </p>

        <p>
          <Link
            href="/login"
            className="font-bold text-sportxo-blue transition-colors hover:text-[#1d4ed8]"
          >
            Change phone number
          </Link>
        </p>
      </div>
    </div>
  );
}
