import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { cn } from "@/lib/cn";

type AuthShellProps = {
  children: React.ReactNode;
  className?: string;
};

/** Responsive auth layout — compact top-aligned on mobile, centered on desktop. */
export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <div className="overflow-x-hidden bg-sportxo-page">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col lg:grid lg:min-h-dvh lg:grid-cols-2">
        <AuthBrandPanel />

        <main
          className={cn(
            "flex w-full flex-col items-center px-4 pb-4 pt-5 sm:px-6 sm:pt-6",
            "lg:flex-1 lg:justify-center lg:px-10 lg:py-16",
            className,
          )}
        >
          <div className="w-full max-w-[440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
