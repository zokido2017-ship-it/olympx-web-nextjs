import { cn } from "@/lib/cn";

type AuthFormPanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthFormPanel({ children, className }: AuthFormPanelProps) {
  return (
    <section className="flex min-h-[480px] flex-1 items-center justify-center bg-sportxo-surface px-4 py-10 sm:px-8 lg:min-h-screen lg:px-12 lg:py-12">
      <div
        className={cn(
          "w-full max-w-[440px] rounded-2xl border border-sportxo-border/80 bg-sportxo-white p-6 shadow-sportxo-card sm:p-8",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}
