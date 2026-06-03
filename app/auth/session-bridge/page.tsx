"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";
import { toast } from "sonner";

import { authDebug } from "@/lib/olympx/auth-debug";
import { logAuthStorageSnapshot } from "@/lib/olympx/auth-storage-snapshot";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/olympx/default-post-login";
import {
  acquireBridgeRunLock,
  establishServerSessionWithProof,
  releaseBridgeRunLock,
} from "@/lib/olympx/establish-server-session";
import { startAuthFlow, trace } from "@/lib/olympx/auth-flow-trace";
import { syncDashboardUserAfterAuth } from "@/lib/dashboard-user-storage";
import {
  readOlympxAccessToken,
  readOlympxAuthJsonFromStorage,
} from "@/lib/olympx/session";

function readNextSafe(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return DEFAULT_POST_LOGIN_PATH;
}

function SessionBridgeInner() {
  const sp = useSearchParams();
  const [message, setMessage] = React.useState("Confirming your session…");

  React.useEffect(() => {
    if (!acquireBridgeRunLock()) return;

    const destination = readNextSafe(sp.get("next"));
    startAuthFlow("session-bridge");
    trace("session.establish.navigate", { destination });
    logAuthStorageSnapshot("session-bridge:enter");

    void (async () => {
      try {
        authDebug("session-bridge", "enter", { destination });
        setMessage("Syncing session cookie with server…");
        const result = await establishServerSessionWithProof(null, destination);

        if (!result.ok) {
          authDebug("session-bridge", "FAIL → login redirect", {
            reason: result.reason,
            redirectCause:
              "establishServerSessionWithProof returned no_token_in_storage",
          });
          setMessage("No session token. Redirecting to sign in…");
          toast.error("Session expired. Please sign in again.");
          window.location.replace(
            `/login?next=${encodeURIComponent(destination)}`,
          );
          return;
        }

        const token = readOlympxAccessToken();
        if (token) {
          syncDashboardUserAfterAuth(
            readOlympxAuthJsonFromStorage() ?? { token },
          );
        }

        if (result.method === "form") {
          authDebug("session-bridge", "form POST /complete — browser navigating", {
            destination,
          });
          setMessage("Signing you in…");
          return;
        }

        authDebug("session-bridge", "SUCCESS → destination", {
          destination,
          attempts: result.attempts,
        });
        trace("navigate.post_login", { destination });
        setMessage("Signed in. Opening your workspace…");
        window.location.replace(destination);
      } finally {
        releaseBridgeRunLock();
      }
    })();
  }, [sp]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      <p className="font-mono text-[10px] text-muted-foreground/80">
        session-bridge — [auth-flow:storage] [auth-flow:establish-session]
      </p>
    </div>
  );
}

export default function SessionBridgePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SessionBridgeInner />
    </Suspense>
  );
}
