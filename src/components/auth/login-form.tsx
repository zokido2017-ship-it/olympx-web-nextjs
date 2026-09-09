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
import { AppleSignInButton } from "@/components/auth/apple-sign-in-button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/cn";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getSignupEntryPath,
} from "@/lib/auth-navigation";
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

  const onGoogleSignIn = () => {
    toast.message("Google sign-in", {
      description: "Connect your OAuth provider in production.",
    });
  };

  const onAppleSignIn = () => {
    toast.message("Apple sign-in", {
      description: "Connect your OAuth provider in production.",
    });
  };

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label
            htmlFor="phoneNumber"
            className="text-[0.8125rem] font-medium text-[#64748B]"
          >
            Phone Number
          </Label>
          <PhoneInput
            id="phoneNumber"
            placeholder="Phone number"
            error={!!errors.phoneNumber}
            countryCode={countryField.field.value}
            onCountryCodeChange={countryField.field.onChange}
            {...register("phoneNumber")}
          />
          <FieldError message={errors.phoneNumber?.message} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center rounded-full bg-sportxo-blue text-sm font-bold text-white transition-colors",
            "hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/30 disabled:opacity-60",
          )}
        >
          {isSubmitting ? "Sending…" : "Send OTP"}
        </button>
      </form>

      <div className="space-y-3">
        <GoogleSignInButton onClick={onGoogleSignIn} />
        <AppleSignInButton onClick={onAppleSignIn} />
      </div>

      <p className="pt-1 text-center text-sm text-[#64748B]">
        Don&apos;t have an account?{" "}
        <Link
          href={getSignupEntryPath()}
          className="font-bold text-sportxo-blue hover:text-[#1d4ed8]"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
