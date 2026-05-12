"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import type { FirebaseError } from "firebase/app";

import { FirebaseMissingConfigBanner } from "@/components/firebase/firebase-missing-config-banner";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/env";
import {
  verifyPhoneOtp,
  mapFirebaseAuthError,
  startPhoneVerification,
} from "@/services/auth.service";
import { syncUserProfileFromAuth } from "@/services/firestore-user.service";
import {
  PHONE_E164_KEY,
  PHONE_OTP_DIGIT_COUNT,
  PHONE_VERIFICATION_ID_KEY,
} from "@/types/auth";

const COOLDOWN_SECONDS = 60;

function maskE164(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length <= 4) return "••••";
  return `••••${digits.slice(-4)}`;
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const firebaseReady = isFirebaseConfigured();
  const [code, setCode] = React.useState("");
  const [working, setWorking] = React.useState(false);
  const [maskedPhone, setMaskedPhone] = React.useState("");
  const [verified, setVerified] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(COOLDOWN_SECONDS);
  const submittedRef = React.useRef("");
  const verifyingRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const id = sessionStorage.getItem(PHONE_VERIFICATION_ID_KEY);
    const raw = sessionStorage.getItem(PHONE_E164_KEY);
    // #region agent log
    fetch(
      "http://127.0.0.1:7297/ingest/13bdd0bb-8657-4d52-9065-eb594d2cac37",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "959e86",
        },
        body: JSON.stringify({
          sessionId: "959e86",
          location: "verify-otp/page.tsx:sessionEffect",
          message: "verify-otp session keys",
          data: { hasVerificationId: Boolean(id), hasPhoneE164: Boolean(raw) },
          timestamp: Date.now(),
          hypothesisId: "H6",
          runId: "pre-fix",
        }),
      },
    ).catch(() => {});
    // #endregion
    React.startTransition(() => {
      setMaskedPhone(raw ? maskE164(raw) : "");
    });
    if (!id || !raw) {
      toast.error("Session expired. Start again from login.");
      router.replace("/login");
    }
  }, [router]);

  React.useEffect(() => {
    if (verified || cooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldown((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown, verified]);

  const runVerify = React.useCallback(
    async (entered: string) => {
      if (
        !firebaseReady ||
        entered.length !== PHONE_OTP_DIGIT_COUNT ||
        verified ||
        verifyingRef.current
      )
        return;

      verifyingRef.current = true;
      setWorking(true);
      try {
        await verifyPhoneOtp(entered);
        const au = getFirebaseAuth().currentUser;
        if (au) await syncUserProfileFromAuth(au);
        setVerified(true);
        toast.success("Signed in.");
        window.setTimeout(() => router.push("/dashboard"), 700);
      } catch (e) {
        submittedRef.current = "";
        const errCode = e instanceof Error ? (e as FirebaseError).code : "";
        toast.error(errCode ? mapFirebaseAuthError(errCode) : (e as Error).message);
      } finally {
        verifyingRef.current = false;
        setWorking(false);
      }
    },
    [firebaseReady, router, verified],
  );

  function handleOtpChange(next: string) {
    const sanitized = next
      .replace(/\D/g, "")
      .slice(0, PHONE_OTP_DIGIT_COUNT);
    setCode(sanitized);
    if (sanitized.length < PHONE_OTP_DIGIT_COUNT) {
      submittedRef.current = "";
      return;
    }
    if (verified || verifyingRef.current || !firebaseReady) return;
    if (submittedRef.current === sanitized) return;
    submittedRef.current = sanitized;
    void runVerify(sanitized);
  }

  async function resend() {
    if (!firebaseReady) return;
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem(PHONE_E164_KEY)
        : null;
    if (!raw || cooldown > 0) return;
    setWorking(true);
    try {
      await startPhoneVerification(raw);
      toast.success("New code sent.");
      setCooldown(COOLDOWN_SECONDS);
      submittedRef.current = "";
      setCode("");
    } catch (e) {
      const errCode = e instanceof Error ? (e as FirebaseError).code : "";
      toast.error(errCode ? mapFirebaseAuthError(errCode) : (e as Error).message);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#030711] text-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_circle_at_30%_-10%,rgba(115,90,255,0.32),transparent_55%),radial-gradient(620px_circle_at_95%_20%,rgba(236,72,153,0.18),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] to-black/55"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-14 sm:px-6">
        {!verified ? (
          <div className="w-full max-w-[400px] space-y-5">
            <FirebaseMissingConfigBanner />
            <Card className="w-full border-white/15 bg-[color-mix(in_oklab,var(--card)_55%,transparent)] shadow-2xl shadow-black/45 backdrop-blur-2xl transition-shadow duration-300 hover:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-4 text-left sm:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-violet-200 ring-1 ring-white/15">
                  <Smartphone className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-lg sm:text-xl">
                    Enter {PHONE_OTP_DIGIT_COUNT}-digit code
                  </CardTitle>
                  <p className="mt-1.5 truncate text-sm text-muted-foreground">
                    Sent to {maskedPhone}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <OtpInput
                  length={PHONE_OTP_DIGIT_COUNT}
                  value={code}
                  onChange={handleOtpChange}
                  disabled={working}
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={cooldown > 0 || working || !firebaseReady}
                    onClick={() => void resend()}
                    className="rounded-2xl border-white/20 bg-transparent transition-colors duration-200 hover:bg-white/[0.06]"
                  >
                    {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend"}
                  </Button>
                  <Button
                    type="button"
                    variant="gradient"
                    onClick={() => void runVerify(code)}
                    disabled={
                      code.length !== PHONE_OTP_DIGIT_COUNT ||
                      working ||
                      !firebaseReady
                    }
                    className="rounded-2xl font-semibold shadow-lg shadow-violet-500/20 transition-opacity hover:opacity-95"
                  >
                    {working ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                    Verify
                  </Button>
                </div>
                <p className="text-center text-[11px] text-muted-foreground">
                  <Link href="/login" className="font-medium underline-offset-4 hover:underline">
                    Use a different number
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex w-full max-w-[400px] flex-col items-center rounded-3xl border border-emerald-500/35 bg-emerald-500/[0.12] px-8 py-12 text-center shadow-[0_20px_60px_rgba(16,185,129,0.2)] backdrop-blur-xl transition-transform duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg">
              <CheckCircle2 className="h-9 w-9" strokeWidth={2} aria-hidden />
            </div>
            <p className="mt-6 text-lg font-semibold">Verified</p>
            <p className="mt-2 text-sm text-muted-foreground">Opening dashboard…</p>
          </div>
        )}
      </div>

      <div id="recaptcha-container" className="sr-only" aria-hidden />
    </div>
  );
}
