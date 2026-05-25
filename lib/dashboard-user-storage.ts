import type { DashboardUser } from "@/lib/data/dashboard-user.mock";
import { DEFAULT_DASHBOARD_USER } from "@/lib/data/dashboard-user.mock";
import type { OlympxRegisterDraft } from "@/lib/olympx/pending-registration";
import type { OlympxAuthResponse } from "@/lib/olympx/session";
import {
  safeLocalStorageGet,
  safeLocalStorageRemove,
  safeLocalStorageSet,
} from "@/lib/safe-web-storage";

const STORAGE_KEY = "olympx_dashboard_user_v1";

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
    email: typeof draft.email === "string" ? draft.email.trim() : "",
    avatarUrl: avatarDataUrl?.trim() ?? "",
    initials: initialsFromName(name),
  };
}

function userFromAuthPayload(auth: OlympxAuthResponse): DashboardUser | null {
  const u = auth.user;
  if (!u || typeof u !== "object") return null;

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
        : [first, last].filter(Boolean).join(" ");

  if (!display.trim()) return null;

  const avatarUrl =
    typeof u.avatar_url === "string"
      ? u.avatar_url
      : typeof u.photo_url === "string"
        ? u.photo_url
        : typeof u.profile_image_url === "string"
          ? u.profile_image_url
          : "";

  const email =
    typeof u.email === "string"
      ? u.email
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

  const name = display.trim();
  return {
    name,
    role,
    email: email.trim(),
    avatarUrl,
    initials: initialsFromName(name),
  };
}

export function readStoredDashboardUser(): DashboardUser | null {
  const raw = safeLocalStorageGet(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DashboardUser;
    if (!parsed?.name || !parsed?.initials) return null;
    return {
      name: parsed.name,
      role: parsed.role ?? "Member",
      email: typeof parsed.email === "string" ? parsed.email : "",
      avatarUrl: parsed.avatarUrl ?? "",
      initials: parsed.initials,
    };
  } catch {
    return null;
  }
}

export function persistDashboardUser(user: DashboardUser): void {
  safeLocalStorageSet(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredDashboardUser(): void {
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
