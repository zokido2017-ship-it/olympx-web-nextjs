"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";
import {
  SIGNUP_SESSION_STORAGE_KEY,
  type SignupSession,
} from "@/types/auth";
import { createDefaultOtpDigits, DEFAULT_OTP } from "@/lib/auth-otp";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  safeSessionGetItem,
  safeSessionRemoveItem,
} from "@/lib/safe-storage";
import { sendOtp } from "@/services/auth-api.service";
import { completePhoneRegistration } from "@/services/registration.service";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

const OTP_LENGTH = 4;
const RESEND_COOLDOWN_SECONDS = 60;

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SignupOtpForm() {
  const router = useRouter();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
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

  const focusIndex = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const updateDigit = (index: number, value: string) => {
    const next = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const copy = [...prev];
      copy[index] = next;
      return copy;
    });
    setError(null);
    if (next && index < OTP_LENGTH - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Backspace") return;
    if (digits[index]) return;
    if (index > 0) {
      event.preventDefault();
      setDigits((prev) => {
        const copy = [...prev];
        copy[index - 1] = "";
        return copy;
      });
      focusIndex(index - 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? "");
    setDigits(next);
    setError(null);
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{4}$/.test(otpValue)) {
      setError("Enter the 4-digit OTP");
      focusIndex(0);
      return;
    }

    if (!signupSession) {
      return;
    }

    setIsSubmitting(true);
    try {
      await completePhoneRegistration(signupSession, otpValue);
      safeSessionRemoveItem(SIGNUP_SESSION_STORAGE_KEY);
      toast.success("Account created");
      router.push("/signup/role");
    } catch (submitError) {
      setError(
        getApiErrorMessage(submitError, "Could not complete registration."),
      );
      focusIndex(0);
    } finally {
      setIsSubmitting(false);
    }
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
      focusIndex(0);
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
      <div className="py-8 text-center text-sm text-[#64748B]">Loading…</div>
    );
  }

  const canResend = secondsLeft <= 0 && !isResending;

  return (
    <div className="space-y-6">
      <p className="text-center text-sm leading-relaxed text-[#64748B]">
        We sent a 4-digit code to{" "}
        <span className="font-semibold text-sportxo-navy">{phoneLabel}</span>
      </p>

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div className="space-y-3">
          <Label className="text-[0.8125rem] font-medium text-[#64748B]">
            Enter OTP
          </Label>
          <div
            className="flex justify-center gap-2.5 sm:gap-3"
            role="group"
            aria-label="One-time password digits"
          >
            {digits.map((digit, index) => (
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
                value={digit}
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                className={cn(
                  "size-12 min-w-0 flex-1 max-w-[3.75rem] rounded-2xl border bg-[#F1F5F9] text-center text-lg font-bold text-sportxo-navy outline-none transition-colors sm:size-14 sm:text-xl",
                  "border-transparent focus:border-sportxo-blue focus:bg-sportxo-white focus:ring-2 focus:ring-sportxo-blue/20",
                  error &&
                    "border-red-400 focus:border-red-500 focus:ring-red-500/20",
                )}
              />
            ))}
          </div>
          <FieldError message={error ?? undefined} />
          <p className="text-center text-xs text-[#64748B]">
            Dev default OTP: <span className="font-semibold">{DEFAULT_OTP}</span>
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center rounded-full bg-sportxo-blue text-sm font-bold text-white transition-colors",
            "hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/30 disabled:opacity-60",
          )}
        >
          {isSubmitting ? "Creating account…" : "Verify & Create Account"}
        </button>
      </form>

      <div className="space-y-3 text-center text-sm text-[#64748B]">
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
              Resend OTP in{" "}
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
            Change Phone Number
          </Link>
        </p>
      </div>
    </div>
  );
}
