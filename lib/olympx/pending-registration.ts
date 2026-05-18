import { z } from "zod";

import {
  safeLocalStorageGet,
  safeLocalStorageRemove,
  safeLocalStorageSet,
  safeSessionStorageGet,
  safeSessionStorageRemove,
  safeSessionStorageSet,
} from "@/lib/safe-web-storage";
import { GENDER_OPTIONS } from "@/types/user-profile";

const REGISTER_DRAFT_KEY = "olympx_register_draft_v1";
const COOKIE_NAME = "olympx_register_draft_v1";
const COOKIE_MAX_AGE_SEC = 60 * 30;

/** Persisted between “Send OTP” and `/register/verify-otp` (session → local → cookie → in-memory). */
export const registerDraftSchema = z.object({
  v: z.literal(1),
  phoneE164: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
  contactEmail: z.string(),
  dob: z.string(),
  /** Legacy drafts may include this; register API still receives a default when absent. */
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

function parseDraft(raw: string): OlympxRegisterDraft | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const r = registerDraftSchema.safeParse(parsed);
    return r.success ? r.data : null;
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

  memoryRegisterDraft = draft;
  const json = JSON.stringify(draft);
  safeSessionStorageSet(REGISTER_DRAFT_KEY, json);
  safeLocalStorageSet(REGISTER_DRAFT_KEY, json);
  setDraftCookie(json);
  return true;
}

export function readRegisterDraft(): OlympxRegisterDraft | null {
  const raw =
    safeSessionStorageGet(REGISTER_DRAFT_KEY) ??
    safeLocalStorageGet(REGISTER_DRAFT_KEY) ??
    readDraftCookie();

  if (raw) {
    const fromStore = parseDraft(raw);
    if (fromStore) return fromStore;
  }

  if (memoryRegisterDraft) {
    const r = registerDraftSchema.safeParse(memoryRegisterDraft);
    if (r.success) return r.data;
  }
  return null;
}

export function clearRegisterDraft(): void {
  memoryRegisterDraft = null;
  safeSessionStorageRemove(REGISTER_DRAFT_KEY);
  safeLocalStorageRemove(REGISTER_DRAFT_KEY);
  clearDraftCookie();
}
