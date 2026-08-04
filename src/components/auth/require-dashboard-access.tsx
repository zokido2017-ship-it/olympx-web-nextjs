"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isAuthenticated,
  isPlayerProfileComplete,
  PLAYER_PROFILE_PATH,
} from "@/lib/auth-session";

function AccessLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 text-sm text-sportxo-text-muted">
      Loading…
    </div>
  );
}

type RequireDashboardAccessProps = {
  children: React.ReactNode;
};

export function RequireDashboardAccess({ children }: RequireDashboardAccessProps) {
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

    if (!isPlayerProfileComplete()) {
      router.replace(PLAYER_PROFILE_PATH);
      return;
    }

    setAllowed(true);
  }, [mounted, router]);

  if (!mounted || !allowed) {
    return <AccessLoading />;
  }

  return <>{children}</>;
}
