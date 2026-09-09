import { cn } from "@/lib/cn";

type AuthFormCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthFormCard({ children, className }: AuthFormCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-[1.75rem] border border-sportxo-border/70 bg-white p-6 shadow-sportxo-card sm:p-8 lg:shadow-[0_24px_60px_-32px_rgb(11_31_58_/_0.18)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
