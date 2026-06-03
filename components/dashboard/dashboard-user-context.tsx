"use client";

import * as React from "react";

import type { DashboardUser } from "@/lib/data/dashboard-user.mock";
import {
  isPlaceholderDashboardUser,
  persistDashboardUser,
  readInitialDashboardUser,
  readStoredDashboardUser,
  resolveDashboardUserFromSession,
} from "@/lib/dashboard-user-storage";
import {
  readOlympxAccessToken,
  readOlympxAuthJsonFromStorage,
  subscribeOlympxSession,
} from "@/lib/olympx/session";
import { useOlympxAuth } from "@/hooks/use-olympx-auth";
import { fetchOlympxUserProfile } from "@/services/olympx-user.service";

type DashboardUserContextValue = {
  user: DashboardUser;
  setUser: React.Dispatch<React.SetStateAction<DashboardUser>>;
  loading: boolean;
};

const DashboardUserContext = React.createContext<DashboardUserContextValue | null>(
  null,
);

export function DashboardUserProvider({ children }: { children: React.ReactNode }) {
  const { session, ready } = useOlympxAuth();
  const [user, setUser] = React.useState<DashboardUser>(readInitialDashboardUser);
  const [loading, setLoading] = React.useState(true);

  const hydrateUser = React.useCallback(async () => {
    if (!ready) {
      return;
    }

    const authSession = session ?? readOlympxAuthJsonFromStorage();
    const hasToken = Boolean(readOlympxAccessToken());
    const storedUser = readStoredDashboardUser();

    if (!hasToken && !authSession && !storedUser) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const fromSession = resolveDashboardUserFromSession(authSession);
    console.log("[DashboardUser] session resolved", {
      authSession,
      fromSession,
      storedDashboardUser: readStoredDashboardUser(),
      hasToken,
    });
    if (!isPlaceholderDashboardUser(fromSession)) {
      setUser(fromSession);
      persistDashboardUser(fromSession);
    } else if (storedUser) {
      setUser(storedUser);
    }

    if (hasToken) {
      try {
        const profile = await fetchOlympxUserProfile();
        if (profile) {
          const next = resolveDashboardUserFromSession(authSession, profile);
          console.log("[DashboardUser] profile fetched", { profile, resolvedUser: next });
          if (!isPlaceholderDashboardUser(next)) {
            setUser(next);
            persistDashboardUser(next);
          }
        }
      } catch (error) {
        console.log("[DashboardUser] profile fetch failed", error);
        const fallback = resolveDashboardUserFromSession(authSession);
        if (!isPlaceholderDashboardUser(fallback)) {
          setUser(fallback);
        }
      }
    }

    setLoading(false);
  }, [ready, session]);

  React.useLayoutEffect(() => {
    const runHydrate = () => {
      void hydrateUser();
    };
    queueMicrotask(runHydrate);
    const unsub = subscribeOlympxSession(runHydrate);
    return unsub;
  }, [hydrateUser]);

  const value = React.useMemo(
    () => ({ user, setUser, loading }),
    [user, loading],
  );

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
