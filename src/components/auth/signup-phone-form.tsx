"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  phoneSignupSchema,
  SIGNUP_SESSION_STORAGE_KEY,
  type PhoneSignupFormValues,
  type SignupSession,
} from "@/types/auth";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { getApiErrorMessage } from "@/lib/api/errors";
import { dialCodeToPhoneCode, normalizeMobileNumber } from "@/lib/phone";
import {
  safeSessionGetItem,
  safeSessionSetItem,
} from "@/lib/safe-storage";
import { sendOtp } from "@/services/auth-api.service";

export function SignupPhoneForm() {
  const router = useRouter();
  const [sessionReady, setSessionReady] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | undefined>();
  const [googleName, setGoogleName] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PhoneSignupFormValues>({
    resolver: zodResolver(phoneSignupSchema),
    defaultValues: {
      countryCode: "+91",
      phoneNumber: "",
    },
  });

  const countryField = useController({ name: "countryCode", control });

  useEffect(() => {
    const raw = safeSessionGetItem(SIGNUP_SESSION_STORAGE_KEY);
    if (!raw) {
      router.replace("/signup");
      return;
    }

    try {
      const session = JSON.parse(raw) as SignupSession;
      if (session.mode !== "google") {
        router.replace("/signup");
        return;
      }
      setGoogleEmail(session.email);
      setGoogleName(session.fullName);
      setSessionReady(true);
    } catch {
      router.replace("/signup");
    }
  }, [router]);

  const onSubmit = handleSubmit(async (values) => {
    const raw = safeSessionGetItem(SIGNUP_SESSION_STORAGE_KEY);
    if (!raw) {
      router.replace("/signup");
      return;
    }

    const session = JSON.parse(raw) as SignupSession;
    const phone_code = dialCodeToPhoneCode(values.countryCode);
    const mobile_number = normalizeMobileNumber(values.phoneNumber);

    try {
      await sendOtp({ phone_code, mobile_number });

      const nextSession: SignupSession = {
        ...session,
        countryCode: values.countryCode,
        phoneNumber: values.phoneNumber,
        phone_code,
        mobile_number,
      };

      safeSessionSetItem(SIGNUP_SESSION_STORAGE_KEY, JSON.stringify(nextSession));
      toast.success("OTP sent");
      router.push("/signup/verify");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not send OTP. Please try again."));
    }
  });

  if (!sessionReady) {
    return (
      <div className="py-10 text-center text-sm text-sportxo-text-muted">Loading…</div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-sportxo-border/80 bg-[#F8FAFC] px-4 py-3 text-center text-sm text-sportxo-text-muted">
        Signed in as{" "}
        <span className="font-semibold text-sportxo-navy">{googleName}</span>
        {googleEmail ? (
          <>
            {" "}
            (<span className="font-medium">{googleEmail}</span>)
          </>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label
            htmlFor="googleSignupPhone"
            className="text-[0.8125rem] font-medium text-sportxo-text-muted"
          >
            Phone number
          </Label>
          <PhoneInput
            id="googleSignupPhone"
            placeholder="Enter mobile number"
            error={!!errors.phoneNumber}
            countryCode={countryField.field.value}
            onCountryCodeChange={countryField.field.onChange}
            {...register("phoneNumber")}
          />
          <FieldError message={errors.phoneNumber?.message} />
        </div>

        <AuthPrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send OTP"}
        </AuthPrimaryButton>
      </form>

      <p className="text-center text-sm text-sportxo-text-muted">
        <Link
          href="/signup"
          className="font-bold text-sportxo-blue hover:text-[#1d4ed8]"
        >
          Back
        </Link>
      </p>
    </div>
  );
}
