import type { OlympxPhoneParts } from "@/lib/phone-e164-parts";
import { splitE164ForOlympx } from "@/lib/phone-e164-parts";
import {
  safeLocalStorageGet,
  safeLocalStorageRemove,
  safeLocalStorageSet,
} from "@/lib/safe-web-storage";
import { PHONE_E164_KEY } from "@/types/auth";

const PENDING_PARTS_KEY = "olympx_pending_phone_parts";

/**
 * Persist phone + API parts for the OTP step on `/login?step=otp`.
 * Prefer localStorage; falls back to URL `e164` when storage is blocked.
 */
export function storePendingOlympxOtp(
  e164: string,
  parts: OlympxPhoneParts,
): string {
  const trimmed = e164.trim();
  const json = JSON.stringify(parts);

  if (typeof window === "undefined") {
    return `/login?step=otp&e164=${encodeURIComponent(trimmed)}`;
  }

  const e164Ok = safeLocalStorageSet(PHONE_E164_KEY, trimmed);
  const partsOk = safeLocalStorageSet(PENDING_PARTS_KEY, json);
  if (e164Ok && partsOk) {
    return "/login?step=otp";
  }

  return `/login?step=otp&e164=${encodeURIComponent(trimmed)}`;
}

export function readPhoneE164(): string | null {
  return safeLocalStorageGet(PHONE_E164_KEY);
}

export function readPendingOlympxOtp(): OlympxPhoneParts | null {
  const raw = safeLocalStorageGet(PENDING_PARTS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    const phone_code =
      typeof o.phone_code === "string"
        ? o.phone_code
        : typeof o.country_code === "string"
          ? o.country_code
          : null;
    const mobile_number =
      typeof o.mobile_number === "string"
        ? o.mobile_number
        : typeof o.phone_number === "string"
          ? o.phone_number
          : null;
    if (!phone_code || !mobile_number) return null;
    return { phone_code, mobile_number };
  } catch {
    return null;
  }
}

/** Resolve handoff from storage or `e164` query (normalized E.164). */
export function resolveOtpHandoff(e164FromQuery: string | null): {
  e164: string;
  parts: OlympxPhoneParts;
} | null {
  const storedE164 = readPhoneE164();
  const storedParts = readPendingOlympxOtp();

  if (storedE164 && storedParts) {
    return { e164: storedE164, parts: storedParts };
  }

  const decoded = e164FromQuery?.trim();
  if (!decoded) return null;
  try {
    const normalized = decodeURIComponent(decoded);
    const parts = splitE164ForOlympx(normalized);
    return { e164: normalized, parts };
  } catch {
    return null;
  }
}

export function clearPendingOlympxOtp(): void {
  safeLocalStorageRemove(PENDING_PARTS_KEY);
  safeLocalStorageRemove(PHONE_E164_KEY);
}
