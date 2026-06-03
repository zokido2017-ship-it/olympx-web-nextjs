const DEV_DEFAULT_BACKEND = "http://127.0.0.1:8000";

/** Prefer IPv4 loopback — avoids Windows Docker/WSL listeners on `[::1]:8000`. */
function normalizeBackendBaseUrl(raw: string): string {
  return raw
    .trim()
    .replace(/\/+$/, "")
    .replace(/^http:\/\/localhost(?=[:/]|$)/i, "http://127.0.0.1")
    .replace(/^https:\/\/localhost(?=[:/]|$)/i, "https://127.0.0.1");
}

export function olympxBackendBaseUrl(): string | null {
  const raw =
    process.env.OLYMPEX_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_OLYMPX_API_URL?.trim();
  if (raw) return normalizeBackendBaseUrl(raw);
  if (process.env.NODE_ENV === "development") {
    return DEV_DEFAULT_BACKEND;
  }
  return null;
}

export function olympxOrganisationsApiPath(): string {
  const configured =
    process.env.NEXT_PUBLIC_OLYMPX_ORGANISATIONS_PATH?.trim() ??
    "api/v1/organisations";
  return configured.replace(/^\/+/, "");
}

export function olympxTeamsApiPath(): string {
  const configured =
    process.env.NEXT_PUBLIC_OLYMPX_TEAMS_PATH?.trim() ?? "api/v1/teams";
  return configured.replace(/^\/+/, "");
}

export function olympxSportsApiPath(): string {
  const configured =
    process.env.NEXT_PUBLIC_OLYMPX_SPORTS_PATH?.trim() ?? "api/v1/sports";
  return configured.replace(/^\/+/, "");
}
