/** Read a single cookie value from a raw `Cookie` request header. */
export function readTokenFromCookieHeader(
  cookieHeader: string | null | undefined,
  name: string,
): string | null {
  if (!cookieHeader?.trim()) return null;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) continue;
    const value = trimmed.slice(name.length + 1).trim();
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return null;
}
