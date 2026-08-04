import { SportxoLogo } from "@/components/auth/sportxo-logo";

type PlayerProfileSetupShellProps = {
  children: React.ReactNode;
};

export function PlayerProfileSetupShell({
  children,
}: PlayerProfileSetupShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-sportxo-page">
      <header className="shrink-0 border-b border-sportxo-border/80 bg-sportxo-white">
        <div className="flex h-16 items-center px-6 md:px-8">
          <SportxoLogo />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[min(100%,90rem)] min-h-0 flex-1 flex-col px-4 py-4 md:px-8 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
