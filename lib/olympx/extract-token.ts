/**
 * Reads bearer / Sanctum / Laravel API tokens from varied JSON shapes, e.g.:
 * - `{ "token": "..." }`
 * - `{ "data": { "token": "..." } }`
 * - `{ "data": { "user": { "access_token": "..." } } }`
 * - `[{ "token": "..." }]` (array payloads)
 *
 * Only considers known token key names at each object (never grabs arbitrary strings).
 */
const TOKEN_KEYS = [
  "token",
  "access_token",
  "accessToken",
  "plainTextToken",
  "plain_text_token",
  "plainToken",
  "bearer_token",
  "bearerToken",
  "auth_token",
  "jwt",
  "api_token",
  "apiToken",
  "personal_access_token",
  "sanctum_token",
] as const;

const MAX_DEPTH = 14;

function pickTokenFromObject(o: Record<string, unknown>): string | null {
  for (const k of TOKEN_KEYS) {
    const v = o[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return null;
}

/** Sanctum sometimes exposes only the raw string in `data`. */
function tokenFromDataField(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (t.length < 8) return null;
  if (!/^[\w\-|.+/=]+$/.test(t)) return null;
  return t;
}

export function extractAuthTokenFromApiBody(data: unknown): string | null {
  if (data === null || data === undefined) return null;

  const seen = new WeakSet<object>();

  const walk = (node: unknown, depth: number): string | null => {
    if (depth > MAX_DEPTH || node === null || typeof node !== "object") return null;

    if (Array.isArray(node)) {
      for (const item of node) {
        const hit = walk(item, depth + 1);
        if (hit) return hit;
      }
      return null;
    }

    const obj = node as Record<string, unknown>;
    if (seen.has(obj)) return null;
    seen.add(obj);

    const direct = pickTokenFromObject(obj);
    if (direct) return direct;

    const asDataString = tokenFromDataField(obj.data);
    if (asDataString) return asDataString;

    for (const v of Object.values(obj)) {
      if (v !== null && typeof v === "object") {
        const hit = walk(v, depth + 1);
        if (hit) return hit;
      }
    }

    return null;
  };

  if (typeof data === "object" && data !== null) {
    return walk(data, 0);
  }

  return tokenFromDataField(data);
}
