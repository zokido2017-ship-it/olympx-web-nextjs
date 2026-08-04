"use client";

import { FaApple } from "react-icons/fa6";
import { cn } from "@/lib/cn";

type AppleSignInButtonProps = {
  label?: string;
  onClick?: () => void;
  className?: string;
};

export function AppleSignInButton({
  label = "Continue with Apple",
  onClick,
  className,
}: AppleSignInButtonProps) {
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
      <FaApple className="size-5 shrink-0" aria-hidden />
      {label}
    </button>
  );
}
