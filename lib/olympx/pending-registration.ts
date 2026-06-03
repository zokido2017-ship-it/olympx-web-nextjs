import { z } from "zod";

import { formatDateOfBirthForOlympxApi, isValidOlympxDateOfBirth } from "@/lib/olympx/format-dob";
import {
  safeLocalStorageGet,
  safeLocalStorageRemove,
  safeLocalStorageSet,
  safeSessionStorageGet,
  safeSessionStorageRemove,
  safeSessionStorageSet,
} from "@/lib/safe-web-storage";
import { GENDER_OPTIONS, type Gender } from "@/types/user-profile";

const REGISTER_DRAFT_KEY = "olympx_register_draft_v1";
const COOKIE_NAME = "olympx_register_draft_v1";
const COOKIE_MAX_AGE_SEC = 60 * 30;

/** Persisted between “Send OTP” and `/register/verify-otp` (memory → session → local → cookie). */
export const registerDraftSchema = z.object({
  v: z.literal(1),
  phoneE164: z.string().min(1),
  phoneCode: z.string().min(1).optional(),
  mobileNumber: z.string().min(1).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  contactEmail: z.string().min(1),
  dob: z.string().min(1),
  nationality: z.string().optional(),
  gender: z.enum(GENDER_OPTIONS),
});

export type OlympxRegisterDraft = z.infer<typeof registerDraftSchema>;

/** Holds the draft for the current tab when Web Storage rejects writes (ITP, strict containers). */
let memoryRegisterDraft: OlympxRegisterDraft | null = null;

function setDraftCookie(json: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const encoded = encodeURIComponent(json);
    if (encoded.length > 3600) return false;
    document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
    return true;
  } catch {
    return false;
  }
}

function readDraftCookie(): string | null {
  if (typeof document === "undefined") return null;
  try {
    const prefix = `${COOKIE_NAME}=`;
    const row = document.cookie.split("; ").find((r) => r.startsWith(prefix));
    if (!row) return null;
    return decodeURIComponent(row.slice(prefix.length));
  } catch {
    return null;
  }
}

function clearDraftCookie(): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

function readString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return "";
}

function normalizeGender(raw: unknown): Gender | null {
  if (typeof raw !== "string") return null;
  const g = raw.trim().toLowerCase();
  return (GENDER_OPTIONS as readonly string[]).includes(g) ? (g as Gender) : null;
}

/** Accept legacy / API-shaped keys when strict schema parse fails. */
export function coerceRegisterDraft(parsed: unknown): OlympxRegisterDraft | null {
  if (!parsed || typeof parsed !== "object") return null;
  const o = parsed as Record<string, unknown>;

  const phoneE164 = readString(o, "phoneE164", "phone", "mobile", "mobileE164");
  const firstName = readString(o, "firstName", "first_name");
  const lastName = readString(o, "lastName", "last_name");
  const contactEmail = readString(o, "contactEmail", "email", "contact_email");
  const dobRaw = readString(o, "dob", "dateOfBirth", "date_of_birth");
  const dob = formatDateOfBirthForOlympxApi(dobRaw);
  const gender = normalizeGender(o.gender);

  if (!phoneE164 || !firstName || !lastName || !contactEmail || !dob || !gender) {
    return null;
  }

  if (!isValidOlympxDateOfBirth(dob)) {
    return null;
  }

  const draft: OlympxRegisterDraft = {
    v: 1,
    phoneE164,
    phoneCode: readString(o, "phoneCode", "phone_code") || undefined,
    mobileNumber: readString(o, "mobileNumber", "mobile_number") || undefined,
    firstName,
    lastName,
    contactEmail,
    dob,
    gender,
    nationality: readString(o, "nationality") || undefined,
  };

  const strict = registerDraftSchema.safeParse(draft);
  return strict.success ? strict.data : null;
}

function parseDraft(raw: string): OlympxRegisterDraft | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const strict = registerDraftSchema.safeParse(parsed);
    if (strict.success) return strict.data;
    return coerceRegisterDraft(parsed);
  } catch {
    return null;
  }
}

/**
 * Save draft for the OTP step. Always keeps an in-memory copy in the browser so client navigation
 * to `/register/verify-otp` still works when sessionStorage / localStorage are blocked.
 */
export function storeRegisterDraft(draft: OlympxRegisterDraft): boolean {
  if (typeof window === "undefined") return false;

  const strict = registerDraftSchema.safeParse(draft);
  const normalized = strict.success ? strict.data : coerceRegisterDraft(draft);
  if (!normalized) return false;

  memoryRegisterDraft = normalized;

  safeSessionStorageRemove(REGISTER_DRAFT_KEY);
  safeLocalStorageRemove(REGISTER_DRAFT_KEY);
  clearDraftCookie();

  const json = JSON.stringify(normalized);
  safeSessionStorageSet(REGISTER_DRAFT_KEY, json);
  safeLocalStorageSet(REGISTER_DRAFT_KEY, json);
  setDraftCookie(json);
  return true;
}

export function readRegisterDraft(): OlympxRegisterDraft | null {
  if (memoryRegisterDraft) {
    const strict = registerDraftSchema.safeParse(memoryRegisterDraft);
    if (strict.success) return strict.data;
    const coerced = coerceRegisterDraft(memoryRegisterDraft);
    if (coerced) {
      memoryRegisterDraft = coerced;
      return coerced;
    }
  }

  for (const raw of [
    safeSessionStorageGet(REGISTER_DRAFT_KEY),
    safeLocalStorageGet(REGISTER_DRAFT_KEY),
    readDraftCookie(),
  ]) {
    if (!raw) continue;
    const parsed = parseDraft(raw);
    if (parsed) {
      memoryRegisterDraft = parsed;
      return parsed;
    }
  }

  return null;
}

export function clearRegisterDraft(): void {
  memoryRegisterDraft = null;
  safeSessionStorageRemove(REGISTER_DRAFT_KEY);
  safeLocalStorageRemove(REGISTER_DRAFT_KEY);
  clearDraftCookie();
}

/** Ensure phone parts exist (derive from E.164 when missing). */
export function normalizeRegisterDraft(
  draft: OlympxRegisterDraft,
): OlympxRegisterDraft {
  if (draft.phoneCode?.trim() && draft.mobileNumber?.trim()) {
    return draft;
  }
  const parts = splitE164ForOlympx(draft.phoneE164);
  return {
    ...draft,
    phoneCode: parts.phone_code,
    mobileNumber: parts.mobile_number,
  };
}

function phoneE164FromQuery(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("phone");
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw).trim();
    return decoded || null;
  } catch {
    return raw.trim() || null;
  }
}

/** Read draft from memory/storage and merge `?phone=` from the URL when needed. */
export function resolveRegisterDraft(): OlympxRegisterDraft | null {
  const stored = readRegisterDraft();
  const phoneFromQuery = phoneE164FromQuery();

  if (!stored && !phoneFromQuery) return null;
  if (!stored) return null;

  const phoneE164 = stored.phoneE164?.trim() || phoneFromQuery || "";
  if (!phoneE164) return null;

  return normalizeRegisterDraft({
    ...stored,
    phoneE164,
    phoneCode: stored.phoneCode,
    mobileNumber: stored.mobileNumber,
  });
}
