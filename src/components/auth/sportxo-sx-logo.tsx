import { cn } from "@/lib/cn";

type SportxoSxLogoProps = {
  className?: string;
};

export function SportxoSxLogo({ className }: SportxoSxLogoProps) {
  return (
    <div
      className={cn(
        "select-none text-[2.75rem] font-black italic leading-none tracking-[-0.08em] text-white",
        className,
      )}
      aria-hidden
    >
      SX
    </div>
  );
}
