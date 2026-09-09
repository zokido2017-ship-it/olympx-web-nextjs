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
import {
  SIGNUP_SESSION_STORAGE_KEY,
  type SignupSession,
} from "@/types/auth";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import { createDefaultOtpDigits, DEFAULT_OTP } from "@/lib/auth-otp";
import { getApiErrorMessage } from "@/lib/api/errors";
import { navigateAfterSignupSuccess } from "@/lib/auth-navigation";
import {
  safeSessionGetItem,
  safeSessionRemoveItem,
} from "@/lib/safe-storage";
import { sendOtp } from "@/services/auth-api.service";
import { completePhoneRegistration } from "@/services/registration.service";
import { FieldError } from "@/components/ui/field-error";
import { OtpInputGroup, type OtpInputGroupHandle } from "@/components/ui/otp-input-group";

const OTP_LENGTH = 4;
const RESEND_COOLDOWN_SECONDS = 60;

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SignupOtpForm() {
  const router = useRouter();
  const otpRef = useRef<OtpInputGroupHandle>(null);
  const [digits, setDigits] = useState<string[]>(() =>
    createDefaultOtpDigits(OTP_LENGTH),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneLabel, setPhoneLabel] = useState<string | null>(null);
  const [signupSession, setSignupSession] = useState<SignupSession | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const raw = safeSessionGetItem(SIGNUP_SESSION_STORAGE_KEY);
    if (!raw) {
      router.replace("/signup");
      return;
    }

    try {
      const session = JSON.parse(raw) as SignupSession;
      if (!session.phone_code || !session.mobile_number) {
        router.replace("/signup");
        return;
      }
      setSignupSession(session);
      setPhoneLabel(`${session.countryCode} ${session.phoneNumber}`);
    } catch {
      router.replace("/signup");
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
      if (!/^\d{4}$/.test(code) || !signupSession || isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setError(null);
      try {
        await completePhoneRegistration(signupSession, code);
        safeSessionRemoveItem(SIGNUP_SESSION_STORAGE_KEY);
        toast.success("Account created");
        navigateAfterSignupSuccess(router);
      } catch (submitError) {
        setError(
          getApiErrorMessage(submitError, "Could not complete registration."),
        );
        otpRef.current?.focus(0);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, router, signupSession],
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
    if (secondsLeft > 0 || isResending || !signupSession) return;

    setIsResending(true);
    try {
      await sendOtp({
        phone_code: signupSession.phone_code,
        mobile_number: signupSession.mobile_number,
      });
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
  }, [isResending, secondsLeft, signupSession]);

  if (phoneLabel === null) {
    return (
      <div className="py-10 text-center text-sm text-sportxo-text-muted">
        Loading…
      </div>
    );
  }

  const canResend = secondsLeft <= 0 && !isResending;

  return (
    <div className="space-y-4 sm:space-y-5">
      <p className="text-center text-sm leading-relaxed text-sportxo-text-muted sm:text-[0.9375rem]">
        Enter the 4-digit code sent to{" "}
        <span className="font-semibold text-sportxo-navy">{phoneLabel}</span>
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
          <p className="text-center text-xs text-sportxo-text-muted">
            Default OTP: <span className="font-semibold text-sportxo-navy">{DEFAULT_OTP}</span>
          </p>
        </div>

        <AuthPrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Verify & Create Account"}
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
            href="/signup"
            className="font-bold text-sportxo-blue transition-colors hover:text-[#1d4ed8]"
          >
            Change phone number
          </Link>
        </p>
      </div>
    </div>
  );
}
