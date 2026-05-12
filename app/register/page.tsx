"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { GlassPhoneNumberInput } from "@/components/auth/glass-phone-number-input";
import { FirebaseMissingConfigBanner } from "@/components/firebase/firebase-missing-config-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getMissingFirebasePublicEnvVars,
  isFirebaseConfigured,
} from "@/lib/firebase/env";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/lib/validations/auth";
import {
  saveRegistrationRecord,
  mapRegistrationSaveError,
} from "@/services/firestore-user.service";
import { GENDER_OPTIONS, type Gender } from "@/types/user-profile";
import { cn } from "@/lib/utils";

const selectClasses =
  "flex h-11 w-full cursor-pointer rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-foreground shadow-inner shadow-black/20 outline-none transition-colors focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/35 disabled:opacity-50 md:h-12 md:text-[15px]";

function genderLabel(value: Gender) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function RegisterPage() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const firebaseReady = isFirebaseConfigured();

  React.useEffect(() => {
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
          location: "register/page.tsx:mount",
          message: "RegisterPage mounted",
          data: {
            firebaseReady,
            missingKeys: getMissingFirebasePublicEnvVars(),
          },
          timestamp: Date.now(),
          hypothesisId: "H3",
          runId: "pre-fix",
        }),
      },
    ).catch(() => {});
    // #endregion
  }, [firebaseReady]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema) as Resolver<RegistrationInput>,
    defaultValues: {
      fullName: "",
      phone: undefined,
      email: "",
      gender: "",
    },
  });

  async function onSubmit(values: RegistrationInput) {
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
          location: "register/page.tsx:onSubmit",
          message: "submit entered (validated)",
          data: {
            gender: values.gender,
            phoneLen: values.phone?.length ?? 0,
            nameLen: values.fullName.trim().length,
            emailLen: values.email.trim().length,
            firebaseReady,
          },
          timestamp: Date.now(),
          hypothesisId: "H1-H5",
          runId: "pre-fix",
        }),
      },
    ).catch(() => {});
    // #endregion

    if (!firebaseReady) {
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
            location: "register/page.tsx:onSubmit",
            message: "guard: firebase not configured",
            data: { missingKeys: getMissingFirebasePublicEnvVars() },
            timestamp: Date.now(),
            hypothesisId: "H3",
            runId: "post-fix",
          }),
        },
      ).catch(() => {});
      // #endregion
      toast.error(
        "Firebase isn’t configured yet. Add your Web App keys to .env.local (see the banner above), then restart the dev server.",
      );
      return;
    }

    setBusy(true);
    try {
      await saveRegistrationRecord({
        fullName: values.fullName,
        email: values.email,
        phoneE164: values.phone,
        gender: values.gender as Gender,
      });
      toast.success("Registration saved", {
        description:
          "Your profile is stored. Sign in on the login page to continue.",
        duration: 4000,
        className:
          "!border-emerald-500/45 !bg-[color-mix(in_oklab,oklch(0.32_0.12_155)_92%,transparent)] !text-foreground",
      });
      window.setTimeout(() => router.replace("/login"), 700);
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
            location: "register/page.tsx:onSubmit",
            message: "saveRegistrationRecord succeeded",
            data: {},
            timestamp: Date.now(),
            hypothesisId: "H2-H4",
            runId: "pre-fix",
          }),
        },
      ).catch(() => {});
      // #endregion
    } catch (e) {
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
            location: "register/page.tsx:onSubmit",
            message: "saveRegistrationRecord failed",
            data: {
              errName: e instanceof Error ? e.name : "unknown",
              errMsg:
                e instanceof Error
                  ? e.message.slice(0, 160)
                  : String(e).slice(0, 160),
              errCode:
                e !== null &&
                typeof e === "object" &&
                "code" in e &&
                typeof (e as { code: unknown }).code === "string"
                  ? (e as { code: string }).code
                  : "",
            },
            timestamp: Date.now(),
            hypothesisId: "H2",
            runId: "pre-fix",
          }),
        },
      ).catch(() => {});
      // #endregion
      toast.error(mapRegistrationSaveError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#030711] text-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_circle_at_25%_-8%,rgba(115,90,255,0.34),transparent_55%),radial-gradient(620px_circle_at_92%_18%,rgba(236,72,153,0.2),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] to-black/55"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-14 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          <Card className="border-white/15 bg-[color-mix(in_oklab,var(--card)_55%,transparent)] shadow-2xl shadow-black/45 backdrop-blur-2xl">
            <CardContent className="space-y-6 p-8 sm:p-10">
              <FirebaseMissingConfigBanner />
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/35 ring-1 ring-white/20" />
                <h1 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
                  Create account
                </h1>
                <p className="mt-2 max-w-[36ch] text-sm text-muted-foreground">
                  Enter your details — data is saved to Firestore (
                  <span className="font-mono text-[12px]">registrations</span>
                  ).
                </p>
              </div>

              <form
                className="flex flex-col gap-[18px] text-left sm:gap-5"
                onSubmit={handleSubmit(onSubmit, (errs) => {
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
                        location: "register/page.tsx:handleSubmit",
                        message: "client validation failed",
                        data: {
                          fields: Object.keys(errs),
                          genderMsg: errs.gender?.message ?? "",
                        },
                        timestamp: Date.now(),
                        hypothesisId: "H1",
                        runId: "pre-fix",
                      }),
                    },
                  ).catch(() => {});
                  // #endregion
                })}
                noValidate
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    autoComplete="name"
                    {...register("fullName")}
                    aria-invalid={Boolean(errors.fullName)}
                    className="h-11 rounded-xl border-white/15 bg-white/[0.06] md:h-12"
                  />
                  {errors.fullName ? (
                    <p className="text-xs font-medium text-rose-400">
                      {errors.fullName.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
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
                        disabled={busy}
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

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    aria-invalid={Boolean(errors.email)}
                    className="h-11 rounded-xl border-white/15 bg-white/[0.06] md:h-12"
                  />
                  {errors.email ? (
                    <p className="text-xs font-medium text-rose-400">
                      {errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    {...register("gender")}
                    aria-invalid={Boolean(errors.gender)}
                    className={cn(
                      selectClasses,
                      errors.gender && "border-rose-500/60 ring-rose-500/25",
                      !errors.gender && "border-white/15",
                    )}
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
                    <p className="text-xs font-medium text-rose-400">
                      {errors.gender.message}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  disabled={busy}
                  className="mt-1 h-12 rounded-2xl text-[15px] font-semibold shadow-lg shadow-violet-500/25 transition-opacity hover:opacity-95"
                >
                  {busy ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  ) : null}
                  Save to database
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have access?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-violet-200 underline underline-offset-4 hover:text-violet-100"
                >
                  Login
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
