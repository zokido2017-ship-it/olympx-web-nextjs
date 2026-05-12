"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";

/** Mirrors SSR-safe hydration detection without relying on post-mount effects. */
function useIsClientReady() {
  return React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClientReady();

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="rounded-2xl border-white/15 bg-white/5"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {!mounted ? (
        <span className="h-4 w-4" />
      ) : theme === "system" ? (
        <span className="text-xs font-semibold">A</span>
      ) : isDark ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
