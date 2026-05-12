"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FirebaseError } from "firebase/app";

import { GlassPhoneNumberInput } from "@/components/auth/glass-phone-number-input";
import { FirebaseMissingConfigBanner } from "@/components/firebase/firebase-missing-config-banner";
import { GoogleMark } from "@/components/icons/google-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/env";
import { phoneLoginSchema, type PhoneLoginInput } from "@/lib/validations/auth";
import {
  loginWithGoogle,
  logout,
  mapFirebaseAuthError,
  startPhoneVerification,
} from "@/services/auth.service";
import { syncUserProfileFromAuth } from "@/services/firestore-user.service";

export default function LoginPage() {
  const router = useRouter();
  const [googleBusy, setGoogleBusy] = React.useState(false);
  const [phoneBusy, setPhoneBusy] = React.useState(false);
  const firebaseReady = isFirebaseConfigured();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneLoginInput>({
    resolver: zodResolver(phoneLoginSchema) as Resolver<PhoneLoginInput>,
    defaultValues: { phone: undefined },
  });

  async function onGoogle() {
    setGoogleBusy(true);
    try {
      await loginWithGoogle();
      const au = getFirebaseAuth().currentUser;
      if (au) await syncUserProfileFromAuth(au);
      toast.success("Signed in.");
      router.push("/dashboard");
    } catch (e) {
      const code = e instanceof Error ? (e as FirebaseError).code : "";
      toast.error(code ? mapFirebaseAuthError(code) : (e as Error).message);
    } finally {
      setGoogleBusy(false);
    }
  }

  async function onPhoneContinue(values: PhoneLoginInput) {
    setPhoneBusy(true);
    try {
      await logout();
      await startPhoneVerification(values.phone.trim());
      toast.success("Check your phone for the code.");
      router.push("/verify-otp");
    } catch (e) {
      const code = e instanceof Error ? (e as FirebaseError).code : "";
      toast.error(code ? mapFirebaseAuthError(code) : (e as Error).message);
    } finally {
      setPhoneBusy(false);
    }
  }

  const busy = googleBusy || phoneBusy;

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

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-14 sm:px-6">
        <Card className="w-full max-w-[400px] border-white/15 bg-[color-mix(in_oklab,var(--card)_55%,transparent)] shadow-2xl shadow-black/45 backdrop-blur-2xl">
          <CardContent className="p-8 sm:p-10">
            <FirebaseMissingConfigBanner />
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/35 ring-1 ring-white/20" />
              <h1 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
                Aurora
              </h1>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <Button
                type="button"
                variant="gradient"
                disabled={busy || !firebaseReady}
                onClick={() => void onGoogle()}
                className="h-12 w-full rounded-2xl text-[15px] font-semibold shadow-lg shadow-violet-500/25 transition-opacity hover:opacity-95"
              >
                {googleBusy ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                ) : (
                  <GoogleMark className="shrink-0" />
                )}
                Continue with Google
              </Button>

              <div className="relative py-1 text-center">
                <span className="relative z-10 bg-[color-mix(in_oklab,var(--card)_0%,transparent)] px-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/45">
                  or
                </span>
                <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
              </div>

              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onPhoneContinue)}
                noValidate
              >
                <div className="space-y-2 text-left">
                  <Label htmlFor="phone">Phone number</Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <GlassPhoneNumberInput
                        id="phone"
                        ref={field.ref}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        aria-invalid={Boolean(errors.phone)}
                        disabled={phoneBusy}
                        placeholder="Enter mobile number"
                        className="w-full"
                      />
                    )}
                  />
                  {errors.phone ? (
                    <p className="text-xs font-medium text-rose-400">
                      {errors.phone.message}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={busy || !firebaseReady}
                  className="h-12 w-full rounded-2xl text-[15px] font-semibold shadow-lg shadow-violet-500/20 transition-opacity hover:opacity-95"
                >
                  {phoneBusy ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  ) : null}
                  Continue
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      <div id="recaptcha-container" className="sr-only" aria-hidden />
    </div>
  );
}
