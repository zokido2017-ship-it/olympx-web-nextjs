import { cn } from "@/lib/cn";

type CreateTeamSectionProps = {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function CreateTeamSection({
  title,
  badge,
  children,
  className,
}: CreateTeamSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-sportxo-border/80 bg-sportxo-white p-6 shadow-sportxo-soft",
        className,
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="h-6 w-1 rounded-full bg-sportxo-blue" aria-hidden />
        <h2 className="text-base font-bold text-sportxo-navy">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  );
}
