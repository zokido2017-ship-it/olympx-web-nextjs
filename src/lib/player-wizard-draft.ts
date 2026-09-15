import { safeLocalGetItem, safeLocalRemoveItem, safeLocalSetItem } from "@/lib/safe-storage";

export const PLAYER_WIZARD_DRAFT_STORAGE_KEY = "sportxo_player_wizard_draft";

export type PlayerWizardDraft = {
  step: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  selectedSportIds: string[];
  height: string;
  weight: string;
  connections: Record<string, "connected" | "disconnected">;
};

export function readPlayerWizardDraft(): PlayerWizardDraft | null {
  const raw = safeLocalGetItem(PLAYER_WIZARD_DRAFT_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PlayerWizardDraft;
  } catch {
    return null;
  }
}

export function writePlayerWizardDraft(draft: PlayerWizardDraft): void {
  safeLocalSetItem(PLAYER_WIZARD_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function clearPlayerWizardDraft(): void {
  safeLocalRemoveItem(PLAYER_WIZARD_DRAFT_STORAGE_KEY);
}
