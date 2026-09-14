import { safeSessionGetItem, safeSessionRemoveItem, safeSessionSetItem } from "@/lib/safe-storage";

export const VERIFIED_PHONE_SESSION_KEY = "sportxo_verified_phone";

export type VerifiedPhoneSession = {
  phone_code: string;
  mobile_number: string;
  countryCode: string;
  phoneNumber: string;
  registered: boolean;
  player_exists: boolean;
};

export function setVerifiedPhoneSession(session: VerifiedPhoneSession): void {
  safeSessionSetItem(VERIFIED_PHONE_SESSION_KEY, JSON.stringify(session));
}

export function getVerifiedPhoneSession(): VerifiedPhoneSession | null {
  const raw = safeSessionGetItem(VERIFIED_PHONE_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as VerifiedPhoneSession;
    if (!parsed.phone_code || !parsed.mobile_number) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearVerifiedPhoneSession(): void {
  safeSessionRemoveItem(VERIFIED_PHONE_SESSION_KEY);
}

export function isPhoneVerified(): boolean {
  return Boolean(getVerifiedPhoneSession());
}
