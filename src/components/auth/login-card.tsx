import { cn } from "@/lib/cn";

type LoginCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function LoginCard({ children, className }: LoginCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[480px] overflow-hidden rounded-[2rem] bg-sportxo-white shadow-[0_20px_50px_-20px_rgb(37_99_235_/_0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
