"use client";

import * as React from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/hooks/use-auth-context";
import { OlympxAuthProvider } from "@/hooks/use-olympx-auth";
import { useIsClientReady } from "@/hooks/use-is-client-ready";
import { ThemeProvider } from "@/components/providers/theme-provider";

function HydrationSafeToaster() {
  const ready = useIsClientReady();
  if (!ready) return null;
  return (
    <Toaster
      richColors={false}
      closeButton
      position="top-center"
      theme="system"
      toastOptions={{
        classNames: {
          toast:
            "bg-card text-card-foreground shadow-ambient ring-ghost border-0",
          title: "font-semibold text-on-surface",
          description: "text-muted-foreground text-sm leading-[1.5]",
          actionButton:
            "rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-95",
          cancelButton:
            "rounded-md bg-muted px-3 py-1.5 text-xs font-semibold text-foreground ring-ghost hover:bg-surface-container-low",
          closeButton:
            "bg-transparent border-0 text-muted-foreground hover:bg-muted hover:text-foreground",
        },
      }}
    />
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <OlympxAuthProvider>
        <AuthProvider>
          {children}
          <HydrationSafeToaster />
        </AuthProvider>
      </OlympxAuthProvider>
    </ThemeProvider>
  );
}
