"use client";

import { FcGoogle } from "react-icons/fc";
import { cn } from "@/lib/cn";

type GoogleSignInButtonProps = {
  label?: string;
  onClick?: () => void;
  className?: string;
};

export function GoogleSignInButton({
  label = "Continue with Google",
  onClick,
  className,
}: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-[#E2E8F0] bg-sportxo-white text-sm font-semibold text-sportxo-navy transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/20",
        className,
      )}
    >
      <FcGoogle className="size-5 shrink-0" aria-hidden />
      {label}
    </button>
  );
}
