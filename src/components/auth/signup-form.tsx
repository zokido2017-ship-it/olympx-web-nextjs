"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signupSchema, type SignupFormValues } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthDivider, AuthFooterLink } from "@/components/auth/auth-links";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  navigateAfterSignupSuccess,
} from "@/lib/auth-navigation";

export function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Account created");
    navigateAfterSignupSuccess(router);
  });

  const onGoogleSignIn = () => {
    toast.message("Google sign-up", {
      description: "Connect your OAuth provider in production.",
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-sportxo-navy">
          Create account
        </h1>
        <p className="text-sm text-sportxo-text-muted">
          Join Sportxo and connect with the multi-sport ecosystem.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Name</Label>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Alex Morgan"
            error={!!errors.fullName}
            {...register("fullName")}
          />
          <FieldError message={errors.fullName?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={!!errors.email}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Register"}
        </Button>
      </form>

      <AuthDivider />

      <GoogleSignInButton
        label="Continue with Google"
        onClick={onGoogleSignIn}
      />

      <AuthFooterLink
        prompt="Already have an account?"
        linkLabel="Sign in"
        href="/login"
      />
    </div>
  );
}
