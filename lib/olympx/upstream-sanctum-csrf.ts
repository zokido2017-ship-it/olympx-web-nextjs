import { olympxUpstreamFetch } from "@/lib/olympx/upstream-fetch";

/** Laravel session cookies for a single proxied request (Sanctum stateful API). */
export type UpstreamCookieJar = Map<string, string>;

function splitSetCookieHeader(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return raw.split(/,(?=\s*[^;,=]+=)/);
}

/** Merge `Set-Cookie` response headers into a jar (name → value, first segment only). */
export function mergeSetCookieHeaders(
  jar: UpstreamCookieJar,
  headers: Headers,
): void {
  const lines =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : splitSetCookieHeader(headers.get("set-cookie"));

  for (const line of lines) {
    const part = line.split(";")[0]?.trim();
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    jar.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }
}

export function cookieHeaderFromJar(jar: UpstreamCookieJar): string {
  return Array.from(jar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

/** Value for `X-XSRF-TOKEN` (must match Laravel's `XSRF-TOKEN` cookie). */
export function xsrfHeaderFromJar(jar: UpstreamCookieJar): string | null {
  const token = jar.get("XSRF-TOKEN");
  if (!token) return null;
  try {
    return decodeURIComponent(token);
  } catch {
    return token;
  }
}

export function applySanctumCookiesToHeaders(
  jar: UpstreamCookieJar,
  headers: Headers,
): void {
  const cookie = cookieHeaderFromJar(jar);
  if (cookie) {
    headers.set("Cookie", cookie);
  }
  const xsrf = xsrfHeaderFromJar(jar);
  if (xsrf) {
    headers.set("X-XSRF-TOKEN", xsrf);
  }
}

const STATEFUL_ORIGIN =
  process.env.OLYMPEX_STATEFUL_ORIGIN?.trim() || "http://localhost:3000";

/**
 * Prime Sanctum CSRF for server-side proxy calls.
 * Browser → Next never carries Laravel cookies; the BFF must fetch them per request.
 */
export async function primeUpstreamSanctumCsrf(
  base: string,
): Promise<UpstreamCookieJar> {
  const jar: UpstreamCookieJar = new Map();
  const res = await olympxUpstreamFetch(`${base}/sanctum/csrf-cookie`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Origin: STATEFUL_ORIGIN,
      Referer: `${STATEFUL_ORIGIN}/`,
      "X-Requested-With": "XMLHttpRequest",
    },
  });
  mergeSetCookieHeaders(jar, res.headers);
  try {
    await res.arrayBuffer();
  } catch {
    /* drain body */
  }
  return jar;
}

export function apiMutationNeedsSanctumCsrf(
  method: string,
  subpath: string,
): boolean {
  if (method === "GET" || method === "HEAD") return false;
  const normalized = subpath.replace(/^\/+/, "");
  // Public OTP routes are CSRF-exempt on Laravel (bootstrap/app.php).
  if (normalized.startsWith("api/v1/auth/")) return false;
  return normalized.startsWith("api/");
}
