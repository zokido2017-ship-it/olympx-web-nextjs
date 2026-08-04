import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-11 w-full rounded-lg border bg-sportxo-white px-3.5 text-sm text-sportxo-navy shadow-sportxo-soft outline-none transition-colors placeholder:text-sportxo-text-muted",
          "border-sportxo-border focus:border-sportxo-blue focus:ring-2 focus:ring-sportxo-blue/20",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
