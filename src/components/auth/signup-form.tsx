"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SignupGoogleButton } from "@/components/auth/signup-google-button";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import {
  phoneSignupSchema,
  SIGNUP_SESSION_STORAGE_KEY,
  type PhoneSignupFormValues,
  type SignupSession,
} from "@/types/auth";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { getApiErrorMessage } from "@/lib/api/errors";
import { dialCodeToPhoneCode, normalizeMobileNumber } from "@/lib/phone";
import { safeSessionSetItem } from "@/lib/safe-storage";
import { sendOtp } from "@/services/auth-api.service";

export function SignupForm() {
  const router = useRouter();

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

  const persistSignupSession = (session: SignupSession) => {
    safeSessionSetItem(SIGNUP_SESSION_STORAGE_KEY, JSON.stringify(session));
  };

  const onPhoneSubmit = handleSubmit(async (values) => {
    const phone_code = dialCodeToPhoneCode(values.countryCode);
    const mobile_number = normalizeMobileNumber(values.phoneNumber);

    try {
      await sendOtp({ phone_code, mobile_number });

      persistSignupSession({
        mode: "phone",
        countryCode: values.countryCode,
        phoneNumber: values.phoneNumber,
        phone_code,
        mobile_number,
      });

      toast.success("OTP sent");
      router.push("/signup/verify");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not send OTP. Please try again."));
    }
  });

  return (
    <div className="space-y-5">
      <SignupGoogleButton />

      <AuthDivider />

      <form onSubmit={onPhoneSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label
            htmlFor="signupPhoneNumber"
            className="text-[0.8125rem] font-medium text-sportxo-text-muted"
          >
            Phone number
          </Label>
          <PhoneInput
            id="signupPhoneNumber"
            placeholder="Enter mobile number"
            error={!!errors.phoneNumber}
            countryCode={countryField.field.value}
            onCountryCodeChange={countryField.field.onChange}
            {...register("phoneNumber")}
          />
          <FieldError message={errors.phoneNumber?.message} />
        </div>

        <AuthPrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Continue"}
        </AuthPrimaryButton>
      </form>

      <p className="text-center text-sm text-sportxo-text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-sportxo-blue hover:text-[#1d4ed8]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
