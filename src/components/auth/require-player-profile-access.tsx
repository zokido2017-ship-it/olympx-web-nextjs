"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BYPASS_PLAYER_PROFILE_ROUTE_GUARD } from "@/lib/auth-navigation";
import {
  DASHBOARD_PATH,
  isAuthenticated,
  isPlayerProfileComplete,
} from "@/lib/auth-session";

function AccessLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sportxo-page text-sm text-sportxo-text-muted">
      Loading…
    </div>
  );
}

type RequirePlayerProfileAccessProps = {
  children: React.ReactNode;
};

function ProtectedPlayerProfileAccess({
  children,
}: RequirePlayerProfileAccessProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    if (isPlayerProfileComplete()) {
      router.replace(DASHBOARD_PATH);
      return;
    }

    setAllowed(true);
  }, [mounted, router]);

  if (!mounted || !allowed) {
    return <AccessLoading />;
  }

  return <>{children}</>;
}

export function RequirePlayerProfileAccess({
  children,
}: RequirePlayerProfileAccessProps) {
  // UI dev bypass — set BYPASS_PLAYER_PROFILE_ROUTE_GUARD to false for API auth.
  if (BYPASS_PLAYER_PROFILE_ROUTE_GUARD) {
    return <>{children}</>;
  }

  return (
    <ProtectedPlayerProfileAccess>{children}</ProtectedPlayerProfileAccess>
  );
}
