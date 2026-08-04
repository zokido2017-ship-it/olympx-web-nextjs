import { cn } from "@/lib/cn";

type ProfileCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function ProfileCard({ children, className }: ProfileCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-sportxo-border/80 bg-sportxo-white p-6 shadow-sportxo-card",
        className,
      )}
    >
      {children}
    </section>
  );
}
