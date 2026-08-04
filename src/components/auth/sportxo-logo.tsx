import { cn } from "@/lib/cn";

type SportxoLogoProps = {
  className?: string;
  variant?: "light" | "dark";
};

export function SportxoLogo({ className, variant = "dark" }: SportxoLogoProps) {
  const isLight = variant === "light";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-xl font-bold tracking-tight shadow-sportxo-soft",
          isLight
            ? "bg-sportxo-blue text-sportxo-white"
            : "bg-sportxo-white/10 text-sportxo-white ring-1 ring-white/15",
        )}
        aria-hidden
      >
        S
      </span>
      <span
        className={cn(
          "text-2xl font-bold tracking-tight",
          isLight ? "text-sportxo-white" : "text-sportxo-navy",
        )}
      >
        Sport<span className="text-sportxo-blue">xo</span>
      </span>
    </div>
  );
}
