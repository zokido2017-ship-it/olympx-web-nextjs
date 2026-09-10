import { cn } from "@/lib/cn";

type AuthDividerProps = {
  label?: string;
  className?: string;
};

export function AuthDivider({ label = "or", className }: AuthDividerProps) {
  return (
    <div className={cn("relative py-2 text-center", className)}>
      <span className="relative z-10 bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-sportxo-text-muted">
        {label}
      </span>
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-sportxo-border" />
    </div>
  );
}
