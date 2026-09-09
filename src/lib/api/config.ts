const DEFAULT_API_BASE_URL = "https://backend.sportxo.in/api/v1";

/** Sportxo REST API v1 base URL (no trailing slash). */
export function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return (value || DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

/** API host origin, e.g. `https://backend.sportxo.in`. */
export function getApiOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_API_ORIGIN?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return new URL(getApiBaseUrl()).origin;
}

/** Laravel Sanctum current-user endpoint (outside `/api/v1`). */
export function getApiMeUrl(): string {
  return `${getApiOrigin()}/api/me`;
}
