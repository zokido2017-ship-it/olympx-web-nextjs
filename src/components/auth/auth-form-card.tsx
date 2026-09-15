import { cn } from "@/lib/cn";

type AuthFormCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthFormCard({ children, className }: AuthFormCardProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-full overflow-visible rounded-2xl border border-sportxo-border/70 bg-white p-4 shadow-sportxo-card sm:rounded-[1.75rem] sm:p-6 lg:p-8 lg:shadow-[0_24px_60px_-32px_rgb(11_31_58_/_0.18)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
