import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
      <div className="lg:w-[min(52%,560px)] lg:shrink-0">
        <AuthBrandPanel />
      </div>
      {children}
    </div>
  );
}
