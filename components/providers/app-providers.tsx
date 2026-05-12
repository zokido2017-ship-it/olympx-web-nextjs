"use client";

import * as React from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/hooks/use-auth-context";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <Toaster richColors closeButton position="top-center" theme="system" />
      </AuthProvider>
    </ThemeProvider>
  );
}
