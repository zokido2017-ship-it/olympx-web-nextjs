import Link from "next/link";
import { cn } from "@/lib/cn";

type AuthFooterLinkProps = {
  prompt: string;
  linkLabel: string;
  href: string;
  className?: string;
};

export function AuthFooterLink({
  prompt,
  linkLabel,
  href,
  className,
}: AuthFooterLinkProps) {
  return (
    <p
      className={cn(
        "text-center text-sm text-sportxo-text-muted",
        className,
      )}
    >
      {prompt}{" "}
      <Link
        href={href}
        className="font-semibold text-sportxo-blue hover:text-[#1d4ed8]"
      >
        {linkLabel}
      </Link>
    </p>
  );
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="relative flex items-center py-1">
      <div className="grow border-t border-sportxo-border" />
      <span className="mx-3 text-xs font-medium uppercase tracking-wide text-sportxo-text-muted">
        {label}
      </span>
      <div className="grow border-t border-sportxo-border" />
    </div>
  );
}
