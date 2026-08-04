"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiArrowLeft } from "react-icons/hi2";
import { toast } from "sonner";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/types/auth";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (_data: ForgotPasswordFormValues) => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Reset link sent", {
      description: "Check your inbox for password reset instructions.",
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sportxo-text-muted transition-colors hover:text-sportxo-navy"
        >
          <HiArrowLeft className="size-4" aria-hidden />
          Back to sign in
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-sportxo-navy">
          Forgot password?
        </h1>
        <p className="text-sm text-sportxo-text-muted">
          Enter your email and we&apos;ll send you a link to reset your
          password.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
