import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "google";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-sportxo-blue text-sportxo-white shadow-sportxo-soft hover:bg-[#1d4ed8] focus-visible:ring-sportxo-blue/30",
  secondary:
    "border border-sportxo-border bg-sportxo-white text-sportxo-navy shadow-sportxo-soft hover:bg-sportxo-surface focus-visible:ring-sportxo-blue/20",
  google:
    "border border-sportxo-border bg-sportxo-white text-sportxo-navy shadow-sportxo-soft hover:bg-sportxo-surface focus-visible:ring-sportxo-blue/20",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      fullWidth = false,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
