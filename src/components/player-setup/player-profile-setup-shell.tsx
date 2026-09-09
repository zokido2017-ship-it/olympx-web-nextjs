import { SportxoLogo } from "@/components/auth/sportxo-logo";

type PlayerProfileSetupShellProps = {
  children: React.ReactNode;
};

export function PlayerProfileSetupShell({
  children,
}: PlayerProfileSetupShellProps) {
  return (
    <div className="flex min-h-0 flex-col overflow-x-hidden bg-sportxo-page md:min-h-dvh">
      <header className="shrink-0 border-b border-sportxo-border/80 bg-sportxo-white">
        <div className="flex h-14 items-center px-4 sm:h-16 sm:px-6 md:px-8">
          <SportxoLogo />
        </div>
      </header>

      <main className="flex flex-col md:min-h-0 md:flex-1">
        <div className="mx-auto w-full max-w-[min(100%,90rem)] px-3 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
