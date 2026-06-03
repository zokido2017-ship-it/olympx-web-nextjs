import type { DashboardUser } from "@/lib/data/dashboard-user.mock";
import { DEFAULT_DASHBOARD_USER } from "@/lib/data/dashboard-user.mock";
import { resolveOlympxMediaUrl } from "@/lib/olympx/media-url";
import type { OlympxRegisterDraft } from "@/lib/olympx/pending-registration";
import {
  readOlympxAuthJsonFromStorage,
  type OlympxAuthResponse,
} from "@/lib/olympx/session";
import {
  safeLocalStorageGet,
  safeLocalStorageRemove,
  safeLocalStorageSet,
} from "@/lib/safe-web-storage";

const STORAGE_KEY = "olympx_dashboard_user_v1";

/** In-memory fallback when Web Storage is blocked (mirrors auth session pattern). */
let memoryDashboardUser: DashboardUser | null = null;

export function isPlaceholderDashboardUser(user: DashboardUser): boolean {
  return (
    user.name === DEFAULT_DASHBOARD_USER.name &&
    user.initials === DEFAULT_DASHBOARD_USER.initials &&
    !user.avatarUrl &&
    !user.email?.trim()
  );
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "OX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function dashboardUserFromRegisterDraft(
  draft: OlympxRegisterDraft,
  avatarDataUrl?: string | null,
): DashboardUser {
  const name =
    [draft.firstName.trim(), draft.lastName.trim()].filter(Boolean).join(" ") ||
    "Member";
  return {
    name,
    role: "Member",
    email: draft.contactEmail.trim(),
    avatarUrl: avatarDataUrl?.trim() ?? "",
    initials: initialsFromName(name),
  };
}

/** Pull a user object from varied Laravel JSON shapes (`user`, `data.user`, `data`). */
export function extractUserRecordFromPayload(
  payload: unknown,
): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;

  const directUser = o.user;
  if (directUser && typeof directUser === "object" && !Array.isArray(directUser)) {
    return directUser as Record<string, unknown>;
  }

  const data = o.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    const nestedUser = d.user;
    if (nestedUser && typeof nestedUser === "object" && !Array.isArray(nestedUser)) {
      return nestedUser as Record<string, unknown>;
    }
    if (
      typeof d.first_name === "string" ||
      typeof d.firstName === "string" ||
      typeof d.name === "string" ||
      typeof d.display_name === "string" ||
      typeof d.contact_email === "string"
    ) {
      return d;
    }
  }

  if (
    typeof o.first_name === "string" ||
    typeof o.firstName === "string" ||
    typeof o.name === "string" ||
    typeof o.display_name === "string" ||
    typeof o.contact_email === "string"
  ) {
    return o;
  }

  return null;
}

function avatarFromUserRecord(u: Record<string, unknown>): string {
  for (const key of [
    "avatar_url",
    "photo_url",
    "photo_path",
    "profile_image_url",
    "profile_image",
    "profile_photo",
    "profile_photo_url",
    "avatar",
    "image",
  ]) {
    const val = u[key];
    if (typeof val === "string" && val.trim()) {
      return resolveOlympxMediaUrl(val);
    }
  }
  return "";
}

function userFromAuthPayload(auth: OlympxAuthResponse): DashboardUser | null {
  const u = extractUserRecordFromPayload(auth);
  if (!u) return null;

  const first =
    typeof u.first_name === "string"
      ? u.first_name
      : typeof u.firstName === "string"
        ? u.firstName
        : "";
  const last =
    typeof u.last_name === "string"
      ? u.last_name
      : typeof u.lastName === "string"
        ? u.lastName
        : "";
  const display =
    typeof u.display_name === "string"
      ? u.display_name
      : typeof u.name === "string"
        ? u.name
        : typeof u.full_name === "string"
          ? u.full_name
          : [first, last].filter(Boolean).join(" ");

  const nameCandidate =
    display.trim() ||
    first.trim() ||
    last.trim() ||
    (typeof u.mobile === "string" ? u.mobile.trim() : "") ||
    (typeof u.mobile_number === "string" ? u.mobile_number.trim() : "");
  if (!nameCandidate) return null;

  const avatarUrl = avatarFromUserRecord(u);

  const email =
    typeof u.email === "string"
      ? u.email
      : typeof u.contact_email === "string"
        ? u.contact_email
        : typeof u.email_address === "string"
          ? u.email_address
          : typeof u.mail === "string"
            ? u.mail
            : "";

  const role =
    typeof u.role === "string"
      ? u.role
      : typeof u.designation === "string"
        ? u.designation
        : "Member";

  const name = nameCandidate;
  return {
    name,
    role,
    email: email.trim(),
    avatarUrl,
    initials: initialsFromName(name),
  };
}

/** Returns a dashboard user when auth/profile JSON contains identifiable user fields. */
export function dashboardUserFromAuthResponse(
  auth: OlympxAuthResponse,
): DashboardUser | null {
  return userFromAuthPayload(auth);
}

export function readInitialDashboardUser(): DashboardUser {
  const stored = readStoredDashboardUser();
  if (stored) return stored;

  const auth = readOlympxAuthJsonFromStorage();
  if (auth) {
    const fromAuth = userFromAuthPayload(auth);
    if (fromAuth) return fromAuth;
  }

  return DEFAULT_DASHBOARD_USER;
}

/** Resolve navbar user from auth session JSON and optional profile payload. */
export function resolveDashboardUserFromSession(
  auth: OlympxAuthResponse | null,
  profile?: Record<string, unknown> | null,
): DashboardUser {
  const stored = readStoredDashboardUser();

  if (auth) {
    const synthetic = profile ? { ...auth, user: profile } : auth;
    const fromAuth = userFromAuthPayload(synthetic);
    if (fromAuth) {
      return {
        ...fromAuth,
        avatarUrl: fromAuth.avatarUrl || stored?.avatarUrl || "",
        email: fromAuth.email || stored?.email || "",
        initials: fromAuth.initials || initialsFromName(fromAuth.name),
      };
    }
  }

  if (stored) return stored;
  return DEFAULT_DASHBOARD_USER;
}

export function readStoredDashboardUser(): DashboardUser | null {
  if (memoryDashboardUser && !isPlaceholderDashboardUser(memoryDashboardUser)) {
    return memoryDashboardUser;
  }

  const raw = safeLocalStorageGet(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DashboardUser;
    if (!parsed?.name || !parsed?.initials) return null;
    const user: DashboardUser = {
      name: parsed.name,
      role: parsed.role ?? "Member",
      email: typeof parsed.email === "string" ? parsed.email : "",
      avatarUrl: parsed.avatarUrl ? resolveOlympxMediaUrl(parsed.avatarUrl) : "",
      initials: parsed.initials,
    };
    if (isPlaceholderDashboardUser(user)) return null;
    memoryDashboardUser = user;
    return user;
  } catch {
    return null;
  }
}

export function persistDashboardUser(user: DashboardUser): void {
  if (isPlaceholderDashboardUser(user)) return;
  memoryDashboardUser = user;
  safeLocalStorageSet(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredDashboardUser(): void {
  memoryDashboardUser = null;
  safeLocalStorageRemove(STORAGE_KEY);
}

export function persistDashboardUserFromRegistration(
  draft: OlympxRegisterDraft,
  avatarDataUrl?: string | null,
): DashboardUser {
  const user = dashboardUserFromRegisterDraft(draft, avatarDataUrl);
  persistDashboardUser(user);
  return user;
}

/** After login/register: keep stored avatar if API has none; prefer API name when present. */
export function syncDashboardUserAfterAuth(auth: OlympxAuthResponse): DashboardUser {
  const fromApi = userFromAuthPayload(auth);
  const stored = readStoredDashboardUser();

  if (fromApi) {
    const merged: DashboardUser = {
      ...fromApi,
      avatarUrl: fromApi.avatarUrl || stored?.avatarUrl || "",
      email: fromApi.email || stored?.email || "",
      initials: fromApi.initials || initialsFromName(fromApi.name),
    };
    persistDashboardUser(merged);
    return merged;
  }

  if (stored) return stored;

  return DEFAULT_DASHBOARD_USER;
}
