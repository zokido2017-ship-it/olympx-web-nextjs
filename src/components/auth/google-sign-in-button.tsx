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
        "inline-flex h-12 min-h-[3rem] w-full items-center justify-center gap-2.5 rounded-full border border-sportxo-border bg-white text-sm font-semibold text-sportxo-navy shadow-sportxo-soft transition-all",
        "hover:border-sportxo-blue/25 hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sportxo-blue/20 active:scale-[0.99]",
        className,
      )}
    >
      <FcGoogle className="size-5 shrink-0" aria-hidden />
      {label}
    </button>
  );
}
