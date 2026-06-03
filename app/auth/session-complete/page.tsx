"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

import { authDebug } from "@/lib/olympx/auth-debug";
import { recordAuthFlowStep } from "@/lib/olympx/auth-flow-tracer";
import { trace } from "@/lib/olympx/auth-flow-trace";
import { peekStagedBridgeToken } from "@/lib/olympx/bridge-token-handoff";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/olympx/default-post-login";
import { ensureOlympxSessionReady } from "@/lib/olympx/ensure-session-ready";
import {
  clientHasSessionCookie,
  readOlympxAccessToken,
} from "@/lib/olympx/session";
import { checkOlympxServerSession } from "@/lib/olympx/sync-server-session";

export const SESSION_COMPLETE_UI_PATH = "/auth/session-complete";

const POLL_MS = 100;
const MAX_POLLS = 80;

function readNextSafe(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return DEFAULT_POST_LOGIN_PATH;
}

function resolveBridgeToken(): string | null {
  return (
    peekStagedBridgeToken() ??
    readOlympxAccessToken()?.trim() ??
    null
  );
}

function SessionCompleteInner() {
  const sp = useSearchParams();
  const [message, setMessage] = React.useState("Signing you in…");
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const destination = readNextSafe(sp.get("next"));
    recordAuthFlowStep("complete.page.load", {
      dest: destination,
      hasClientCookie: clientHasSessionCookie(),
    });
    authDebug("session-complete", "confirm HTTP cookie then redirect", {
      destination,
      hasClientCookie: clientHasSessionCookie(),
    });

    let cancelled = false;

    void (async () => {
      const token = resolveBridgeToken();
      if (token) {
        setMessage("Syncing session…");
        const ready = await ensureOlympxSessionReady({
          explicitToken: token,
          maxPolls: 40,
          pollMs: POLL_MS,
        });
        recordAuthFlowStep("complete.sync.from_storage", {
          serverConfirmed: ready.serverConfirmed,
          hasToken: Boolean(ready.token),
        });
        if (ready.serverConfirmed && !cancelled) {
          recordAuthFlowStep("complete.session.ok", { via: "sync" });
          trace("navigate.post_login", { destination });
          window.location.replace(destination);
          return;
        }
      }

      for (let attempt = 1; attempt <= MAX_POLLS; attempt += 1) {
        if (cancelled) return;

        const ok = await checkOlympxServerSession();
        recordAuthFlowStep("complete.session.poll", {
          attempt,
          ok,
          hasClientCookie: clientHasSessionCookie(),
        });

        if (ok) {
          recordAuthFlowStep("complete.session.ok", { attempt });
          trace("navigate.post_login", { destination });
          authDebug("session-complete", "HTTP cookie confirmed — navigating", {
            destination,
            attempt,
          });
          window.location.replace(destination);
          return;
        }

        if (token && attempt % 10 === 0) {
          await ensureOlympxSessionReady({
            explicitToken: token,
            maxPolls: 5,
            pollMs: POLL_MS,
          });
        }

        await new Promise((r) => window.setTimeout(r, POLL_MS));
      }

      if (cancelled) return;
      recordAuthFlowStep("complete.session.fail", {
        reason: "max_polls",
        failurePoint: "session-complete/page.tsx",
        hasClientCookie: clientHasSessionCookie(),
        hasStoredToken: Boolean(resolveBridgeToken()),
      });
      authDebug("session-complete", "FAIL — GET session never returned ok", {
        destination,
        hasClientCookie: clientHasSessionCookie(),
        hasStoredToken: Boolean(resolveBridgeToken()),
      });
      setFailed(true);
      setMessage("Could not confirm your session.");
    })();

    return () => {
      cancelled = true;
    };
  }, [sp]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      {!failed ? (
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      ) : null}
      <p className="max-w-sm text-sm text-muted-foreground" role="status">
        {message}
      </p>
      {failed ? (
        <a
          href={`/login?next=${encodeURIComponent(readNextSafe(sp.get("next")))}`}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Return to sign in
        </a>
      ) : null}
    </div>
  );
}

export default function SessionCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SessionCompleteInner />
    </Suspense>
  );
}
