import { cn } from "@/lib/cn";

type TeamSummaryTileProps = {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
};

export function TeamSummaryTile({
  label,
  value,
  icon: Icon,
  iconClassName,
}: TeamSummaryTileProps) {
  return (
    <div className="rounded-xl border border-sportxo-border/70 bg-[#F8FAFC] p-4">
      <span
        className={cn(
          "mb-3 flex size-9 items-center justify-center rounded-lg",
          iconClassName,
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <p className="text-2xl font-bold text-sportxo-navy">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-sportxo-text-muted">{label}</p>
    </div>
  );
}
