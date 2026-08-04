import { cn } from "@/lib/cn";

type ProfileSectionProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function ProfileSection({
  title,
  description,
  action,
  children,
  className,
}: ProfileSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-sportxo-navy">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-sportxo-text-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
