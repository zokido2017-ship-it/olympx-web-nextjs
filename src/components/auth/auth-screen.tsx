import { TAGLINE } from "@/constants/brand";
import { SportxoLogo } from "@/components/auth/sportxo-logo";
import { cn } from "@/lib/cn";

type AuthScreenProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthScreen({ children, className }: AuthScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sportxo-surface px-4 py-10 sm:px-6">
      <div className="w-full max-w-[440px]">
        <header className="mb-8 flex flex-col items-center text-center">
          <SportxoLogo className="justify-center" />
          <p className="mt-3 max-w-[320px] text-sm leading-relaxed text-sportxo-text-muted">
            {TAGLINE}
          </p>
        </header>

        <div
          className={cn(
            "rounded-2xl border border-sportxo-border/80 bg-sportxo-white p-6 shadow-sportxo-card sm:p-8",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
