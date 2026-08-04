import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Checkbox = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "size-4 shrink-0 rounded border-sportxo-border text-sportxo-blue shadow-sportxo-soft",
        "focus:ring-2 focus:ring-sportxo-blue/20 focus:ring-offset-0",
        className,
      )}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";
