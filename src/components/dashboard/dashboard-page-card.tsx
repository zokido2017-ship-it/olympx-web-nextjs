import type { LucideIcon } from "lucide-react";

type DashboardPageCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function DashboardPageCard({
  icon: Icon,
  title,
  description,
  children,
}: DashboardPageCardProps) {
  return (
    <section className="mx-auto w-full max-w-3xl rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
