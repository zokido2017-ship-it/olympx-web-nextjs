import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { cn } from "@/lib/cn";

type AuthShellProps = {
  children: React.ReactNode;
  className?: string;
};

/** Responsive auth layout — brand panel on desktop, focused card on mobile. */
export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <div className="min-h-dvh bg-sportxo-page">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col lg:grid lg:grid-cols-2">
        <AuthBrandPanel />

        <main
          className={cn(
            "flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16",
            className,
          )}
        >
          <div className="w-full max-w-[440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
