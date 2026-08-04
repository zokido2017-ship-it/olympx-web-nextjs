import { cn } from "@/lib/cn";

type SetupSectionCardProps = {
  step?: string;
  title?: string;
  hideHeader?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function SetupSectionCard({
  step,
  title,
  hideHeader = false,
  children,
  className,
}: SetupSectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-sportxo-border/80 bg-sportxo-white p-8 shadow-sportxo-card",
        className,
      )}
    >
      {!hideHeader && step && title ? (
        <header className="mb-6 border-b border-sportxo-border/70 pb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sportxo-blue">
            {step}
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-sportxo-navy">
            {title}
          </h2>
        </header>
      ) : null}
      {children}
    </section>
  );
}
