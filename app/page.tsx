import Link from "next/link";

import { SiteNavbar } from "@/components/layout/site-navbar";
import { Button } from "@/components/ui/button";

/** Landing: editorial hero + asymmetric layout (Kinetic Gallery — plays.md). */
export default function Home() {
  return (
    <div className="min-h-dvh bg-surface text-foreground">
      <SiteNavbar />
      <main className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-surface via-surface to-surface-container-low"
          aria-hidden
        />
        <section className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 lg:px-8 lg:pb-32 lg:pt-20">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.78fr)] lg:items-end lg:gap-10">
            <div className="space-y-8 lg:space-y-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                Aurora identity
              </p>
              <h1 className="text-balance text-4xl font-semibold tracking-[-0.02em] text-on-surface sm:text-5xl lg:text-[3.35rem] lg:leading-[1.12]">
                Sign in with clarity.
              </h1>
              <p className="text-2xl font-semibold tracking-[-0.02em] text-muted-foreground sm:text-3xl lg:text-[2rem] lg:leading-snug">
                Move without friction.
              </p>
              <p className="max-w-xl text-base leading-[1.5] text-muted-foreground md:text-lg">
                A calm, layered surface for account access—built around tonal depth,
                generous spacing, and a signature blue gradient for decisive actions.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button variant="gradient" className="shadow-ambient" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/register">Create account</Link>
                </Button>
              </div>
            </div>

            <aside className="lg:pb-2">
              <div className="rounded-3xl bg-card p-8 shadow-ambient ring-ghost lg:p-9">
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                  At a glance
                </p>
                <ul className="mt-6 space-y-5 text-sm leading-[1.5] text-muted-foreground">
                  <li className="flex gap-3">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-tertiary"
                      aria-hidden
                    />
                    <span>
                      <span className="font-medium text-on-surface">Layered surfaces</span>
                      —cards lift from the page using ambient light, not harsh lines.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                    <span>
                      <span className="font-medium text-on-surface">Primary gradient</span>
                      —hero CTAs use the 135° kinetic signature from brand blue to sky.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-on-surface/25"
                      aria-hidden
                    />
                    <span>
                      <span className="font-medium text-on-surface">Editorial type</span>
                      —Inter with tight display tracking and breathable body copy.
                    </span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
