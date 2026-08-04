"use client";

import dynamic from "next/dynamic";
import { RequirePlayerProfileAccess } from "@/components/auth/require-player-profile-access";

const PlayerProfileSetupForm = dynamic(
  () =>
    import("@/components/player-setup/player-profile-setup-form").then(
      (mod) => mod.PlayerProfileSetupForm,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-sportxo-text-muted">
        Loading profile…
      </div>
    ),
  },
);

export function PlayerProfileRoute() {
  return (
    <RequirePlayerProfileAccess>
      <PlayerProfileSetupForm />
    </RequirePlayerProfileAccess>
  );
}
