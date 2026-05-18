"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { useOlympxAuth } from "@/hooks/use-olympx-auth";
import { isOlympxAuthBypassed } from "@/lib/olympx/auth-bypass";
import { authDebug } from "@/lib/olympx/auth-debug";
import { readOlympxAccessToken } from "@/lib/olympx/session";
import { checkOlympxServerSession } from "@/lib/olympx/sync-server-session";

/** No dashboard chrome — avoids mixing dashboard shell with unauthenticated users during redirect. */
function AuthGatePending() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-background text-muted-foreground"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
      <span className="sr-only">Checking session…</span>
    </div>
  );
}

export function RequireOlympxAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const bypass = isOlympxAuthBypassed();
  const router = useRouter();
  const { isAuthenticated, ready, refresh } = useOlympxAuth();

  React.useEffect(() => {
    if (bypass) return;
    if (!ready) return;
    if (isAuthenticated) return;

    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void (async () => {
          if (cancelled) return;
          if (readOlympxAccessToken()) {
            refresh();
            return;
          }
          if (await checkOlympxServerSession()) {
            refresh();
            return;
          }
          const next =
            typeof window !== "undefined"
              ? `${window.location.pathname}${window.location.search}`
              : "/dashboard";
          authDebug("guard", "redirect: no session after checks", {
            to: `/login?next=${encodeURIComponent(next)}`,
          });
          router.replace(`/login?next=${encodeURIComponent(next)}`);
        })();
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [bypass, ready, isAuthenticated, router, refresh]);

  if (bypass) {
    return <>{children}</>;
  }

  if (!ready || !isAuthenticated) {
    return <AuthGatePending />;
  }

  return <>{children}</>;
}
