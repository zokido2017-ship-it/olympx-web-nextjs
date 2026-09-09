import { SportxoLogo } from "@/components/auth/sportxo-logo";
import { cn } from "@/lib/cn";

type AuthEntryHeaderProps = {
  title?: string;
  subtitle?: string;
  className?: string;
};

export function AuthEntryHeader({
  title = "Log in or create account",
  subtitle,
  className,
}: AuthEntryHeaderProps) {
  return (
    <header className={cn("mb-8 text-center lg:mb-10 lg:text-left", className)}>
      <div className="mb-6 flex justify-center lg:justify-start">
        <SportxoLogo />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-sportxo-navy sm:text-[1.75rem]">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 text-sm leading-relaxed text-sportxo-text-muted sm:text-[0.9375rem]">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
