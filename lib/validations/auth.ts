import { isValidPhoneNumber } from "libphonenumber-js/min";
import { z } from "zod";

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

/**
 * Registration (passwordless): profile only. Data is persisted to Firestore under `registrations/{id}`.
 */
export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name must be under 80 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.preprocess(
    (raw) =>
      raw === undefined || raw === null ? "" : String(raw),
    z
      .string()
      .min(1, "Phone number is required.")
      .refine((v) => isValidPhoneNumber(v.trim()), {
        message: "Enter a valid international mobile number.",
      })
      .transform((v) => v.trim()),
  ),
  gender: z.string().superRefine((val, ctx) => {
    if (!(GENDER_OPTIONS as readonly string[]).includes(val)) {
      ctx.addIssue({
        code: "custom",
        message: "Select your gender.",
      });
    }
  }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
