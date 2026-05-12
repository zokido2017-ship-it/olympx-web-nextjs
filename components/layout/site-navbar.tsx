"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

const BRAND = "Aurora";

const links = [
  { href: "/login" as const, label: "Login" },
  { href: "/register" as const, label: "Register" },
];

export function SiteNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  function linkCls(href: string) {
    const active = pathname === href;
    return cn(
      "block rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition-colors duration-200 md:px-4 md:text-[15px]",
      active
        ? "bg-foreground/[0.08] text-foreground ring-1 ring-foreground/[0.1]"
        : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground",
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-foreground/[0.08] bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[3.5rem] sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 sm:h-9 sm:w-9"
            aria-hidden
          />
          <span className="text-[15px] font-semibold tracking-tight">{BRAND}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkCls(item.href)}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-foreground/10 text-foreground transition-colors duration-200 hover:bg-foreground/[0.06] md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-foreground/[0.08] bg-background px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-1 sm:px-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(linkCls(item.href), "py-3")}
                onClick={() => setMobileOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
