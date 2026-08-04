import { SportxoLogo } from "@/components/auth/sportxo-logo";

type PlayerProfileShellProps = {
  children: React.ReactNode;
};

export function PlayerProfileShell({ children }: PlayerProfileShellProps) {
  return (
    <div className="min-w-[1280px] bg-sportxo-surface">
      <header className="border-b border-sportxo-border/80 bg-sportxo-white">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center px-8">
          <SportxoLogo />
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-8 py-8">{children}</main>
    </div>
  );
}
