"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  LOGIN_PHONE_STORAGE_KEY,
  phoneLoginSchema,
  type PhoneLoginFormValues,
} from "@/types/auth";
import { SignupGoogleButton } from "@/components/auth/signup-google-button";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getSignupEntryPath } from "@/lib/auth-navigation";
import { dialCodeToPhoneCode, normalizeMobileNumber } from "@/lib/phone";
import { safeSessionSetItem } from "@/lib/safe-storage";
import { sendOtp } from "@/services/auth-api.service";

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PhoneLoginFormValues>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      countryCode: "+91",
      phoneNumber: "",
    },
  });

  const countryField = useController({ name: "countryCode", control });

  const onSubmit = handleSubmit(async (values) => {
    const phoneCode = dialCodeToPhoneCode(values.countryCode);
    const mobileNumber = normalizeMobileNumber(values.phoneNumber);

    try {
      await sendOtp({
        phone_code: phoneCode,
        mobile_number: mobileNumber,
      });

      safeSessionSetItem(
        LOGIN_PHONE_STORAGE_KEY,
        JSON.stringify({
          countryCode: values.countryCode,
          phoneNumber: values.phoneNumber,
          phone_code: phoneCode,
          mobile_number: mobileNumber,
        }),
      );
      toast.success("OTP sent");
      router.push("/login/verify");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not send OTP. Please try again."));
    }
  });

  return (
    <div className="space-y-4">
      <SignupGoogleButton />

      <AuthDivider />

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label
            htmlFor="phoneNumber"
            className="text-[0.8125rem] font-medium text-sportxo-text-muted"
          >
            Phone number
          </Label>
          <PhoneInput
            id="phoneNumber"
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
        New to Sportxo?{" "}
        <Link
          href={getSignupEntryPath()}
          className="font-bold text-sportxo-blue hover:text-[#1d4ed8]"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
