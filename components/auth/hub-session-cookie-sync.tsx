"use client";

import * as React from "react";

import { authDebug } from "@/lib/olympx/auth-debug";
import { recordAuthFlowStep } from "@/lib/olympx/auth-flow-tracer";
import {
  ensureOlympxSessionCookieFromStorage,
  readOlympxAccessToken,
} from "@/lib/olympx/session";
import {
  checkOlympxServerSession,
  syncOlympxSessionToServer,
} from "@/lib/olympx/sync-server-session";

/**
 * Ensures the proxy-readable HTTP session cookie exists when the user has a
 * client-side token (localStorage). Without this, navigation from /organizations
 * to /teams/* fails in proxy.ts before the page loads.
 */
export function HubSessionCookieSync() {
  React.useEffect(() => {
    const token = readOlympxAccessToken()?.trim();
    if (!token) return;

    ensureOlympxSessionCookieFromStorage();

    void (async () => {
      const serverOk = await checkOlympxServerSession();
      if (serverOk) return;

      recordAuthFlowStep("hub.sync.cookie.start", {});
      authDebug("hub-sync", "syncing HTTP session cookie for hub navigation", {
        hasToken: true,
      });

      const synced = await syncOlympxSessionToServer(token);
      recordAuthFlowStep("hub.sync.cookie.done", { synced });
      ensureOlympxSessionCookieFromStorage();
    })();
  }, []);

  return null;
}
