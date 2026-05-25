"use client";

import * as React from "react";

import type { DashboardUser } from "@/lib/data/dashboard-user.mock";
import { DEFAULT_DASHBOARD_USER } from "@/lib/data/dashboard-user.mock";
import {
  persistDashboardUser,
  readStoredDashboardUser,
} from "@/lib/dashboard-user-storage";
import { readOlympxAuthJsonFromStorage } from "@/lib/olympx/session";
import { fetchOlympxUserProfile } from "@/services/olympx-user.service";

type DashboardUserContextValue = {
  user: DashboardUser;
  setUser: React.Dispatch<React.SetStateAction<DashboardUser>>;
};

const DashboardUserContext = React.createContext<DashboardUserContextValue | null>(
  null,
);

export function DashboardUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<DashboardUser>(() => {
    const stored = readStoredDashboardUser();
    return stored ?? DEFAULT_DASHBOARD_USER;
  });

  React.useLayoutEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const profile = await fetchOlympxUserProfile();
        if (cancelled || !profile) return;

        // Reuse the existing auth->user normalizer by temporarily shaping a minimal auth response.
        const authJson = readOlympxAuthJsonFromStorage();
        const syntheticAuth = { ...(authJson ?? {}), user: profile };
        // Lazily import to avoid circular deps with storage <-> provider.
        const { syncDashboardUserAfterAuth } = await import(
          "@/lib/dashboard-user-storage"
        );
        const next = syncDashboardUserAfterAuth(syntheticAuth);
        if (cancelled) return;
        setUser(next);
        persistDashboardUser(next);
      } catch {
        // Keep stored/default user if profile fetch fails.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = React.useMemo(() => ({ user, setUser }), [user]);

  return (
    <DashboardUserContext.Provider value={value}>
      {children}
    </DashboardUserContext.Provider>
  );
}

export function useDashboardUser() {
  const ctx = React.useContext(DashboardUserContext);
  if (!ctx) {
    throw new Error("useDashboardUser must be used within DashboardUserProvider");
  }
  return ctx;
}
