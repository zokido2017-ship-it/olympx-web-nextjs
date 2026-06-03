"use client";

/**
 * OTP sign-in — Laravel Scribe authentication:
 * http://127.0.0.1:8000/api-docs#authentication
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Fingerprint,
  Loader2,
  Lock,
  Send,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { GlassPhoneNumberInput } from "@/components/auth/glass-phone-number-input";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { syncDashboardUserAfterAuth } from "@/lib/dashboard-user-storage";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/olympx/default-post-login";
import { useOlympxAuth } from "@/hooks/use-olympx-auth";
import { authDebug, authDebugMaskToken } from "@/lib/olympx/auth-debug";
import { startAuthFlow, trace, traceToken } from "@/lib/olympx/auth-flow-trace";
import { recordAuthFlowStepWithStorage } from "@/lib/olympx/auth-flow-tracer";
import {
  clearPendingOlympxOtp,
  readPendingOlympxOtp,
  readPhoneE164,
  resolveOtpHandoff,
  storePendingOlympxOtp,
} from "@/lib/olympx/pending-otp";
import { phoneFieldValueFromForm } from "@/lib/phone-field-value";
import type { OlympxPhoneParts } from "@/lib/phone-e164-parts";
import { splitE164ForOlympx } from "@/lib/phone-e164-parts";
import {
  ensureOlympxSessionCookieFromStorage,
  getOlympxTokenFromAuth,
  persistOlympxAuthResponse,
  readOlympxAccessToken,
  readOlympxAuthJsonFromStorage,
} from "@/lib/olympx/session";
import { establishSessionAndNavigateAsync } from "@/lib/olympx/post-login-navigation";
import { checkOlympxServerSession } from "@/lib/olympx/sync-server-session";
import { toastAfterSendOtp } from "@/lib/olympx/toast-send-otp-result";
import {
  phoneLoginSchema,
  type PhoneLoginInput,
} from "@/lib/validations/auth";
import {
  isOlympxHttpError,
  olympxLoginWithOtp,
  olympxSendOtp,
  sendOtpRequiresRegistration,
} from "@/services/olympx-auth.service";
import { PHONE_OTP_DIGIT_COUNT } from "@/types/auth";

const RESEND_COOLDOWN_SEC = 60;

function maskPhone(input: string) {
  const d = input.replace(/\D/g, "");
  if (d.length <= 4) return "••••";
  return `••••${d.slice(-4)}`;
}

function readNextSafe(sp: URLSearchParams): string | null {
  const n = sp.get("next");
  if (n && n.startsWith("/") && !n.startsWith("//")) return n;
  return null;
}

function withNext(path: string): string {
  try {
    const next = readNextSafe(new URLSearchParams(window.location.search));
    if (!next) return path;
    const u = new URL(path, "http://localhost");
    if (!u.searchParams.has("next")) u.searchParams.set("next", next);
    return `${u.pathname}${u.search}`;
  } catch {
    return path;
  }
}

export function AuthLoginPage() {
  const router = useRouter();
  const { applyAuthResponse, refresh } = useOlympxAuth();

  const [phase, setPhase] = React.useState<"boot" | "phone" | "otp">("boot");
  const [maskedPhone, setMaskedPhone] = React.useState("");
  const [otpCode, setOtpCode] = React.useState("");
  const [phoneWorking, setPhoneWorking] = React.useState(false);
  const [otpWorking, setOtpWorking] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [done, setDone] = React.useState(false);

  const handoffRef = React.useRef<{
    e164: string;
    parts: OlympxPhoneParts;
  } | null>(null);
  const otpSubmitLock = React.useRef("");
  const otpBusyRef = React.useRef(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PhoneLoginInput>({
    resolver: zodResolver(phoneLoginSchema) as Resolver<PhoneLoginInput>,
    defaultValues: { phone: undefined },
  });

  const dest = React.useCallback(() => {
    try {
      return (
        readNextSafe(new URLSearchParams(window.location.search)) ??
        DEFAULT_POST_LOGIN_PATH
      );
    } catch {
      return DEFAULT_POST_LOGIN_PATH;
    }
  }, []);

  const activeHandoff = React.useCallback((): {
    e164: string;
    parts: OlympxPhoneParts;
  } | null => {
    if (handoffRef.current) return handoffRef.current;
    const e164 = readPhoneE164();
    const parts = readPendingOlympxOtp();
    if (e164 && parts) {
      const h = { e164, parts };
      handoffRef.current = h;
      return h;
    }
    try {
      return resolveOtpHandoff(
        new URLSearchParams(window.location.search).get("e164"),
      );
    } catch {
      return null;
    }
  }, []);

  React.useLayoutEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const onOtpStep = sp.get("step") === "otp";

    void (async () => {
      let t = readOlympxAccessToken();
      if (!t && (await checkOlympxServerSession())) {
        refresh();
        ensureOlympxSessionCookieFromStorage();
        t = readOlympxAccessToken();
      }

      // Do not hijack the OTP step with a stale storage token — wait for verifyOtp.
      if (t && !onOtpStep) {
        const destination = dest();
        if (await checkOlympxServerSession()) {
          authDebug("auth-login", "resume session (cookie already set)", {
            token: authDebugMaskToken(t),
            destination,
          });
          window.location.assign(destination);
          return;
        }
        const resumed = readOlympxAuthJsonFromStorage() ?? { token: t };
        applyAuthResponse(resumed);
        syncDashboardUserAfterAuth(resumed);
        authDebug("auth-login", "resume session via form POST /complete", {
          token: authDebugMaskToken(t),
          destination,
        });
        await establishSessionAndNavigateAsync(t, destination);
        return;
      }

      queueMicrotask(() => {
        const pre = sp.get("phone");
        if (pre) {
          try {
            setValue("phone", decodeURIComponent(pre));
          } catch {
            setValue("phone", pre);
          }
        }
        if (sp.get("step") === "otp") {
          const h = resolveOtpHandoff(sp.get("e164"));
          if (h) {
            handoffRef.current = h;
            setMaskedPhone(maskPhone(h.e164));
            setPhase("otp");
            return;
          }
          toast.message("Continue with your phone", {
            description: "We could not restore the code step.",
          });
        }
        setPhase("phone");
      });
    })();
  }, [router, applyAuthResponse, refresh, setValue, dest]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(
      () => setCooldown((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const backToPhone = React.useCallback(() => {
    clearPendingOlympxOtp();
    handoffRef.current = null;
    setOtpCode("");
    otpSubmitLock.current = "";
    setCooldown(0);
    setPhase("phone");
    const u = new URL("/login", window.location.origin);
    const n = readNextSafe(new URLSearchParams(window.location.search));
    if (n) u.searchParams.set("next", n);
    router.replace(u.pathname + u.search);
  }, [router]);

  const onPhone = React.useCallback(
    async (values: PhoneLoginInput) => {
      setPhoneWorking(true);
      try {
        const e164 = values.phone.trim();
        const parts = splitE164ForOlympx(e164);
        const sendRes = await olympxSendOtp(parts);
        const path = storePendingOlympxOtp(e164, parts);
        toastAfterSendOtp(sendRes, {
          title: "Code sent",
          description: "POST /api/v1/auth/send-otp succeeded. Check your phone.",
        });
        handoffRef.current = { e164, parts };
        setMaskedPhone(maskPhone(e164));
        setOtpCode("");
        otpSubmitLock.current = "";
        router.replace(withNext(path));
        setPhase("otp");
      } catch (e) {
        if (isOlympxHttpError(e) && sendOtpRequiresRegistration(e)) {
          toast.message("Register first", {
            description: "This number is not registered yet.",
          });
          router.push(`/register?phone=${encodeURIComponent(values.phone.trim())}`);
          return;
        }
        toast.error(e instanceof Error ? e.message : "Could not send OTP.");
      } finally {
        setPhoneWorking(false);
      }
    },
    [router],
  );

  const verifyOtp = React.useCallback(
    async (raw: string) => {
      const code = raw.replace(/\D/g, "").slice(0, PHONE_OTP_DIGIT_COUNT);
      if (
        code.length !== PHONE_OTP_DIGIT_COUNT ||
        done ||
        otpBusyRef.current
      ) {
        return;
      }
      const handoff = activeHandoff();
      if (!handoff) {
        toast.error("Session expired. Enter your phone again.");
        backToPhone();
        return;
      }
      otpBusyRef.current = true;
      setOtpWorking(true);
      try {
        startAuthFlow("login-otp-verify");
        trace("otp.validate.start");
        authDebug("auth-login", "step 1: POST validate-otp", {});

        const auth = await olympxLoginWithOtp(handoff.parts, code);
        trace("otp.validate.ok");
        recordAuthFlowStepWithStorage("otp.validate.ok", {
          hasUser: Boolean(auth.user),
        });
        authDebug("auth-login", "step 2: validate-otp OK — persisting token", {});

        persistOlympxAuthResponse(auth);
        const token = getOlympxTokenFromAuth(auth) ?? readOlympxAccessToken();
        traceToken("session.post.start", token);
        if (!token) {
          trace("otp.validate.fail", { reason: "no_token_in_response" });
          recordAuthFlowStepWithStorage("otp.validate.fail", {
            reason: "no_token_in_response",
          });
          toast.error("No access token in API response.");
          return;
        }
        recordAuthFlowStepWithStorage("otp.token.persisted", {});
        authDebug("auth-login", "step 3: token saved to storage + document.cookie", {
          token: authDebugMaskToken(token),
        });

        applyAuthResponse(auth);
        syncDashboardUserAfterAuth(auth);
        clearPendingOlympxOtp();
        handoffRef.current = null;
        setDone(true);
        toast.success("Welcome back");
        const destination =
          readNextSafe(new URLSearchParams(window.location.search)) ??
          DEFAULT_POST_LOGIN_PATH;
        authDebug("auth-login", "step 4: sync session cookie then navigate", {
          destination,
        });
        const navigated = await establishSessionAndNavigateAsync(
          token,
          destination,
        );
        if (navigated) return;
        toast.error("Could not establish session. Please try again.");
      } catch (e) {
        otpSubmitLock.current = "";
        if (isOlympxHttpError(e) && sendOtpRequiresRegistration(e)) {
          router.replace(`/register?phone=${encodeURIComponent(handoff.e164)}`);
          return;
        }
        toast.error(e instanceof Error ? e.message : "Invalid code.");
      } finally {
        if (!done) {
          otpBusyRef.current = false;
          setOtpWorking(false);
        }
      }
    },
    [activeHandoff, applyAuthResponse, backToPhone, done, router],
  );

  const onOtpInput = React.useCallback(
    (next: string) => {
      const s = next.replace(/\D/g, "").slice(0, PHONE_OTP_DIGIT_COUNT);
      setOtpCode(s);
      if (s.length < PHONE_OTP_DIGIT_COUNT) {
        otpSubmitLock.current = "";
        return;
      }
      if (done || otpBusyRef.current) return;
      if (otpSubmitLock.current === s) return;
      otpSubmitLock.current = s;
      void verifyOtp(s);
    },
    [done, verifyOtp],
  );

  const resend = React.useCallback(async () => {
    const handoff = activeHandoff();
    if (!handoff || cooldown > 0 || otpWorking) return;
    setOtpWorking(true);
    try {
      const sendRes = await olympxSendOtp(splitE164ForOlympx(handoff.e164));
      toastAfterSendOtp(sendRes, {
        title: "Code resent",
        description: "Use the latest SMS code.",
      });
      setCooldown(RESEND_COOLDOWN_SEC);
      otpSubmitLock.current = "";
      setOtpCode("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Resend failed.");
    } finally {
      setOtpWorking(false);
    }
  }, [activeHandoff, cooldown, otpWorking]);

  if (phase === "boot") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <Fingerprint className="h-12 w-12 animate-pulse text-primary" />
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-surface text-foreground">
      <div
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-tertiary/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 pb-12 pt-10 sm:px-6">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.35em] text-on-surface-variant">
          Olympx
        </p>
        <h1 className="mt-2 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-center text-sm text-muted-foreground">
          OTP via{" "}
          <span className="font-mono text-[0.8rem] text-on-surface">
            /api/v1/auth/send-otp
          </span>{" "}
          &amp;{" "}
          <span className="font-mono text-[0.8rem] text-on-surface">
            validate-otp
          </span>
          . Session persists after refresh.
        </p>

        <div className="mx-auto mt-8 flex w-full max-w-[340px] rounded-full border border-transparent bg-muted/40 p-1 shadow-inner ring-1 ring-ghost">
          <div
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold transition-colors ${
              phase === "phone"
                ? "bg-card text-primary shadow-ambient"
                : "text-muted-foreground"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Phone
          </div>
          <div
            id="login-step-label-otp"
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold transition-colors ${
              phase === "otp"
                ? "bg-card text-primary shadow-ambient"
                : "text-muted-foreground"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            Code
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === "phone" ? (
            <motion.div
              key="p"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mt-8 rounded-3xl bg-card/95 p-6 shadow-ambient ring-1 ring-ghost backdrop-blur-sm sm:p-8"
            >
              <form
                className="space-y-5"
                noValidate
                onSubmit={(ev) => {
                  ev.preventDefault();
                  void handleSubmit(onPhone)(ev);
                }}
              >
                <div>
                  <Label htmlFor="auth-phone" className="text-on-surface">
                    Phone number
                  </Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <GlassPhoneNumberInput
                        id="auth-phone"
                        ref={field.ref}
                        value={phoneFieldValueFromForm(field.value)}
                        onChange={(v) =>
                          field.onChange(
                            v === null || v === "" ? undefined : v,
                          )
                        }
                        onBlur={field.onBlur}
                        aria-invalid={Boolean(errors.phone)}
                        disabled={phoneWorking}
                        className="mt-2 w-full"
                        placeholder="+1 ···"
                      />
                    )}
                  />
                  {errors.phone ? (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                      {errors.phone.message}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={phoneWorking}
                  className="h-12 w-full gap-2 text-base font-semibold"
                >
                  {phoneWorking ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send code
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                No account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Register
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="o"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mt-8 rounded-3xl bg-card/95 p-6 shadow-ambient ring-1 ring-ghost backdrop-blur-sm sm:p-8"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-4 -ml-2 gap-1.5 text-muted-foreground"
                onClick={backToPhone}
                disabled={otpWorking}
              >
                <ArrowLeft className="h-4 w-4" />
                Edit phone
              </Button>
              <p className="text-sm text-muted-foreground">
                Code sent to{" "}
                <span className="font-medium text-on-surface">{maskedPhone}</span>
              </p>
              <div className="mt-6">
                <OtpInput
                  length={PHONE_OTP_DIGIT_COUNT}
                  value={otpCode}
                  onChange={onOtpInput}
                  disabled={otpWorking || done}
                />
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse sm:gap-3">
                <Button
                  type="button"
                  variant="gradient"
                  className="flex-1 font-semibold"
                  disabled={
                    otpCode.length !== PHONE_OTP_DIGIT_COUNT ||
                    otpWorking ||
                    done
                  }
                  onClick={() => void verifyOtp(otpCode)}
                >
                  {otpWorking && !done ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Sign in
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={cooldown > 0 || otpWorking || done}
                  onClick={() => void resend()}
                >
                  {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend code"}
                </Button>
              </div>
              {done ? (
                <p className="mt-4 text-center text-sm text-primary">
                  Redirecting to dashboard…
                </p>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mx-auto mt-8 max-w-sm text-center font-mono text-[10px] leading-relaxed text-on-surface-variant">
          API docs: 127.0.0.1:8000/api-docs#authentication
        </p>
      </div>
    </div>
  );
}
