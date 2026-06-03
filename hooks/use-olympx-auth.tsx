"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

import { authDebug, authDebugMaskToken } from "@/lib/olympx/auth-debug";
import { recordAuthFlowStep } from "@/lib/olympx/auth-flow-tracer";
import {
  ensureOlympxSessionCookieFromStorage,
  getOlympxTokenFromAuth,
  readOlympxAccessToken,
  readOlympxAuthJsonFromStorage,
  subscribeOlympxSession,
  type OlympxAuthResponse,
} from "@/lib/olympx/session";
import {
  checkOlympxServerSession,
  syncOlympxSessionToServer,
} from "@/lib/olympx/sync-server-session";

type OlympxAuthContextValue = {
  token: string | null;
  session: OlympxAuthResponse | null;
  ready: boolean;
  /** True when a readable token OR the app session cookie exists (matches middleware). */
  isAuthenticated: boolean;
  refresh: () => void;
  applyAuthResponse: (auth: OlympxAuthResponse) => void;
};

const OlympxAuthContext = createContext<OlympxAuthContextValue | null>(null);

export function OlympxAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<OlympxAuthResponse | null>(null);
  const [ready, setReady] = useState(false);
  const [hasServerSession, setHasServerSession] = useState(false);

  const readIntoState = useCallback((): string | null => {
    ensureOlympxSessionCookieFromStorage();
    const nextToken = readOlympxAccessToken();
    const nextSession = readOlympxAuthJsonFromStorage();
    setToken(nextToken);
    setSession(nextSession);
    if (nextToken) setHasServerSession(false);
    return nextToken;
  }, []);

  const refresh = useCallback(() => {
    readIntoState();
    void checkOlympxServerSession().then((ok) => {
      setHasServerSession(Boolean(ok && !readOlympxAccessToken()));
    });
  }, [readIntoState]);

  const applyAuthResponse = useCallback((auth: OlympxAuthResponse) => {
    const t = getOlympxTokenFromAuth(auth);
    if (!t) return;
    const merged: OlympxAuthResponse = { ...auth, token: t };
    flushSync(() => {
      setToken(t);
      setSession(merged);
      setHasServerSession(false);
      setReady(true);
    });
    authDebug("auth-state", "applyAuthResponse (flushSync)", {
      hasToken: true,
      token: authDebugMaskToken(t),
      authState: "authenticated",
    });
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      readIntoState();
      const initialToken = readOlympxAccessToken();

      if (initialToken) {
        setReady(true);
        recordAuthFlowStep("auth-provider.boot", {
          hasToken: true,
          isAuthenticatedWillBe: true,
        });
        void (async () => {
          await syncOlympxSessionToServer(initialToken);
          if (cancelled) return;
          ensureOlympxSessionCookieFromStorage();
          readIntoState();
          recordAuthFlowStep("auth-provider.boot.sync.done", {
            hasToken: Boolean(readOlympxAccessToken()),
          });
          authDebug("auth-state", "OlympxAuthProvider boot complete (token)", {
            hasToken: true,
          });
        })();
      } else {
        void (async () => {
          const ok = await checkOlympxServerSession();
          if (cancelled) return;
          recordAuthFlowStep("auth-provider.boot", {
            hasToken: false,
            serverSessionOnly: ok,
          });
          if (ok) {
            setHasServerSession(true);
            readIntoState();
          } else {
            setHasServerSession(false);
          }
          setReady(true);
          authDebug("auth-state", "OlympxAuthProvider boot complete", {
            hasToken: Boolean(readOlympxAccessToken()),
            serverSessionOnly: Boolean(ok && !readOlympxAccessToken()),
          });
        })();
      }
    });

    const unsub = subscribeOlympxSession(() => {
      queueMicrotask(() => {
        readIntoState();
        void checkOlympxServerSession().then((ok) => {
          setHasServerSession(Boolean(ok && !readOlympxAccessToken()));
        });
      });
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [readIntoState]);

  const isAuthenticated = Boolean(token || hasServerSession);

  const value = useMemo<OlympxAuthContextValue>(
    () => ({
      token,
      session,
      ready,
      isAuthenticated,
      refresh,
      applyAuthResponse,
    }),
    [token, session, ready, isAuthenticated, refresh, applyAuthResponse],
  );

  return (
    <OlympxAuthContext.Provider value={value}>
      {children}
    </OlympxAuthContext.Provider>
  );
}

export function useOlympxAuth(): OlympxAuthContextValue {
  const ctx = useContext(OlympxAuthContext);
  if (!ctx) {
    throw new Error("useOlympxAuth must be used within OlympxAuthProvider.");
  }
  return ctx;
}
