import { cn } from "@/lib/cn";

type ProfileStatTileProps = {
  label: string;
  value: string;
  helper?: string;
  highlight?: boolean;
  className?: string;
};

export function ProfileStatTile({
  label,
  value,
  helper,
  highlight = false,
  className,
}: ProfileStatTileProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4",
        highlight
          ? "border-sportxo-blue/25 bg-[#EFF6FF]"
          : "border-sportxo-border/80 bg-sportxo-white shadow-sportxo-soft",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-sportxo-text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-sportxo-navy">
        {value}
      </p>
      {helper ? (
        <p className="mt-1 text-xs text-sportxo-text-muted">{helper}</p>
      ) : null}
    </div>
  );
}
