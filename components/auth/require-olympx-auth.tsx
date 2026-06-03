"use client";



import { Loader2 } from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

import * as React from "react";



import { useOlympxAuth } from "@/hooks/use-olympx-auth";

import {
  isOlympxAuthBypassedForPath,
  isOlympxDevHubAccessBypassed,
} from "@/lib/olympx/auth-bypass";

import { authDebug } from "@/lib/olympx/auth-debug";

import { recordAuthFlowStep } from "@/lib/olympx/auth-flow-tracer";

import { trace } from "@/lib/olympx/auth-flow-trace";

import { DEFAULT_POST_LOGIN_PATH } from "@/lib/olympx/default-post-login";

import { recoverOlympxClientSession } from "@/lib/olympx/ensure-session-ready";

import { readOlympxAccessToken } from "@/lib/olympx/session";

import { submitSessionCompleteForm } from "@/lib/olympx/submit-session-complete-form";

import { checkOlympxServerSession } from "@/lib/olympx/sync-server-session";



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

  const pathname = usePathname() ?? "/";

  // TODO: Restore proper authentication — remove isOlympxDevHubAccessBypassed from bypass.
  const bypass =
    isOlympxAuthBypassedForPath(pathname) ||
    isOlympxDevHubAccessBypassed(pathname);

  const router = useRouter();

  const { isAuthenticated, ready, refresh } = useOlympxAuth();

  const [recovering, setRecovering] = React.useState(false);



  React.useEffect(() => {

    if (bypass) return;

    if (!ready) return;

    if (isAuthenticated) return;



    const clientToken = readOlympxAccessToken();

    if (clientToken) {

      recordAuthFlowStep("guard.token.in_storage", { pathname });

      refresh();

    }



    let cancelled = false;



    queueMicrotask(() => {

      setRecovering(true);

      void (async () => {

        recordAuthFlowStep("guard.recovery.start", { pathname });



        const serverOkBefore = await checkOlympxServerSession();

        if (cancelled) return;



        if (serverOkBefore) {

          recordAuthFlowStep("guard.server.ok", { pathname });

          refresh();

          setRecovering(false);

          return;

        }



        const serverConfirmed = await recoverOlympxClientSession();

        if (cancelled) return;



        const tokenAfter = readOlympxAccessToken();

        const serverOkAfter = serverConfirmed || (await checkOlympxServerSession());



        if (serverOkAfter) {

          recordAuthFlowStep("guard.recovery.ok", { pathname });

          refresh();

          setRecovering(false);

          return;

        }



        if (tokenAfter) {

          recordAuthFlowStep("guard.bridge.form_complete", {

            pathname,

            reason: "localStorage token present but proxy cookie missing",

          });

          authDebug("guard", "bridge: form POST /complete (token without HTTP cookie)", {

            pathname,

          });

          submitSessionCompleteForm(tokenAfter, pathname);

          return;

        }



        setRecovering(false);

        const next =

          typeof window !== "undefined"

            ? `${window.location.pathname}${window.location.search}`

            : DEFAULT_POST_LOGIN_PATH;

        trace("guard.redirect_login", {

          to: `/login?next=${encodeURIComponent(next)}`,

          redirectSource: "require-olympx-auth.tsx",

          reason: "no token in storage and no server session cookie",

        });

        authDebug("guard", "redirect: no session after recovery", {

          to: `/login?next=${encodeURIComponent(next)}`,

          redirectSource: "require-olympx-auth.tsx client guard",

        });

        router.replace(`/login?next=${encodeURIComponent(next)}`);

      })();

    });



    return () => {

      cancelled = true;

    };

  }, [bypass, ready, isAuthenticated, router, refresh, pathname]);



  if (bypass) {

    return <>{children}</>;

  }



  if (!ready || recovering || !isAuthenticated) {

    return <AuthGatePending />;

  }



  return <>{children}</>;

}


