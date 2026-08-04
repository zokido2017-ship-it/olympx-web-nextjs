"use client";

import { PlayerProfileWizard } from "@/components/player-setup/player-profile-wizard";
import { PlayerProfileSetupShell } from "@/components/player-setup/player-profile-setup-shell";

export function PlayerProfileSetupContent() {
  return (
    <PlayerProfileSetupShell>
      <PlayerProfileWizard />
    </PlayerProfileSetupShell>
  );
}
