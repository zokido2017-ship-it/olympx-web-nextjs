import { isValidPhoneNumber } from "libphonenumber-js/min";
import { z } from "zod";

import { PHONE_OTP_DIGIT_COUNT } from "@/types/auth";
import { GENDER_OPTIONS } from "@/types/user-profile";

/** Login: SMS OTP phone number — same validity as registration (E.164 from intl picker). */
export const phoneLoginSchema = z.object({
  phone: z.preprocess(
    (raw) => (raw === undefined || raw === null ? "" : String(raw)),
    z
      .string()
      .min(1, "Phone number is required.")
      .refine((v) => isValidPhoneNumber(v.trim()), {
        message: "Enter a valid international mobile number.",
      })
      .transform((v) => v.trim()),
  ),
});

export type PhoneLoginInput = z.infer<typeof phoneLoginSchema>;

/** `POST /api/v1/auth/register` — fields collected here; phone → `phone_code` + `mobile_number`. */
export const registrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(255, "First name is too long."),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(255, "Last name is too long."),
  phone: z.preprocess(
    (raw) => (raw === undefined || raw === null ? "" : String(raw)),
    z
      .string()
      .min(1, "Phone number is required.")
      .refine((v) => isValidPhoneNumber(v.trim()), {
        message: "Enter a valid international mobile number.",
      })
      .transform((v) => v.trim()),
  ),
  contactEmail: z
    .string()
    .trim()
    .min(1, "Contact email is required.")
    .email("Enter a valid email address."),
  dob: z
    .string()
    .trim()
    .min(1, "Date of birth is required.")
    .refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "Enter a valid date of birth.",
    }),
  gender: z.preprocess(
    (raw) =>
      raw === "" || raw === null || raw === undefined ? undefined : String(raw),
    z.enum(GENDER_OPTIONS, { message: "Select your gender." }),
  ),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

/** Step 2: OTP after `send-otp`, before `register`. */
export const registrationOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d+$/, "Verification code must be digits only.")
    .refine((v) => v.length === PHONE_OTP_DIGIT_COUNT, {
      message: `Enter the ${PHONE_OTP_DIGIT_COUNT}-digit verification code.`,
    }),
});

export type RegistrationOtpInput = z.infer<typeof registrationOtpSchema>;
