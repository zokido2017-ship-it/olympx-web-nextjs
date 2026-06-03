"use client";

import * as React from "react";

import {
  resolveRegisterDraft,
  storeRegisterDraft,
  type OlympxRegisterDraft,
} from "@/lib/olympx/pending-registration";

type RegisterDraftContextValue = {
  draft: OlympxRegisterDraft | null;
  setDraft: (draft: OlympxRegisterDraft) => void;
  refreshDraft: () => OlympxRegisterDraft | null;
};

const RegisterDraftContext = React.createContext<RegisterDraftContextValue | null>(
  null,
);

export function RegisterDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraftState] = React.useState<OlympxRegisterDraft | null>(() => {
    if (typeof window === "undefined") return null;
    return resolveRegisterDraft();
  });

  const setDraft = React.useCallback((next: OlympxRegisterDraft) => {
    storeRegisterDraft(next);
    setDraftState(next);
  }, []);

  const refreshDraft = React.useCallback(() => {
    const resolved = resolveRegisterDraft();
    setDraftState(resolved);
    return resolved;
  }, []);

  const value = React.useMemo(
    () => ({ draft, setDraft, refreshDraft }),
    [draft, setDraft, refreshDraft],
  );

  return (
    <RegisterDraftContext.Provider value={value}>
      {children}
    </RegisterDraftContext.Provider>
  );
}

export function useRegisterDraft() {
  const ctx = React.useContext(RegisterDraftContext);
  if (!ctx) {
    throw new Error("useRegisterDraft must be used within RegisterDraftProvider.");
  }
  return ctx;
}
