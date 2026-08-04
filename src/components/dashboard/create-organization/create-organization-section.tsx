import { cn } from "@/lib/cn";

type CreateOrganizationSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function CreateOrganizationSection({
  title,
  children,
  className,
}: CreateOrganizationSectionProps) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex items-center gap-3">
        <span className="h-6 w-1 rounded-full bg-sportxo-blue" aria-hidden />
        <h2 className="text-base font-bold text-sportxo-blue">{title}</h2>
      </div>
      {children}
    </section>
  );
}
