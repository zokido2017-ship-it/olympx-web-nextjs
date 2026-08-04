import { TAGLINE } from "@/constants/brand";
import { SportxoLogo } from "@/components/auth/sportxo-logo";
import { SportsTechVisual } from "@/components/auth/sports-tech-visual";

export function AuthBrandPanel() {
  return (
    <aside className="relative flex flex-col justify-between overflow-hidden bg-sportxo-navy px-6 py-10 text-sportxo-white sm:px-10 lg:min-h-screen lg:px-14 lg:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#2563EB33,_transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-sportxo-blue/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10">
        <SportxoLogo variant="light" />
        <p className="mt-8 max-w-md text-lg leading-relaxed text-white/85 sm:text-xl">
          {TAGLINE}
        </p>
      </div>

      <div className="relative z-10 hidden md:block">
        <SportsTechVisual />
      </div>
    </aside>
  );
}
