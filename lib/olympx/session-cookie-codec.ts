/**
 * Encode bearer tokens for cookie storage (Sanctum tokens contain `|` which can
 * break naive Cookie parsing). Values are prefixed so legacy raw cookies still work.
 */
const COOKIE_VALUE_PREFIX = "b64.";

function toBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(encoded: string): string | null {
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(encoded, "base64url").toString("utf8");
    }
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (padded.length % 4)) % 4;
    const binary = atob(padded + "=".repeat(pad));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** Store token in a cookie-safe encoded form. */
export function encodeSessionCookieValue(token: string): string {
  const trimmed = token.trim();
  if (!trimmed) return "";
  const bytes = new TextEncoder().encode(trimmed);
  return `${COOKIE_VALUE_PREFIX}${toBase64Url(bytes)}`;
}

/** Decode cookie value to bearer token (supports legacy raw Sanctum tokens). */
export function decodeSessionCookieValue(stored: string | null | undefined): string | null {
  if (!stored?.trim()) return null;
  const value = stored.trim();
  if (value.startsWith(COOKIE_VALUE_PREFIX)) {
    return fromBase64Url(value.slice(COOKIE_VALUE_PREFIX.length));
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
