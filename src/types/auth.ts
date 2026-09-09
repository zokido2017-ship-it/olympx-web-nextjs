import { z } from "zod";

export const phoneLoginSchema = z.object({
  countryCode: z.string().min(1),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .min(8, "Enter a valid phone number"),
});

export type PhoneLoginFormValues = z.infer<typeof phoneLoginSchema>;

export const LOGIN_PHONE_STORAGE_KEY = "sportxo_login_phone";

export type StoredLoginPhone = {
  countryCode: string;
  phoneNumber: string;
};

export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .length(4, "Enter the 4-digit OTP")
    .regex(/^\d{4}$/, "OTP must be 4 digits"),
});

export type OtpVerificationFormValues = z.infer<typeof otpVerificationSchema>;

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(1, "Name is required")
    .min(2, "Enter your name"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
