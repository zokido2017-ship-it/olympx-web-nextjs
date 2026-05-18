/**
 * Same-site check for session bootstrap POST /api/auth/olympx-session.
 * Treats localhost / 127.0.0.1 / ::1 as the same dev host so Origin and Host
 * mismatches do not 403 (session cookie would never be set → middleware treats user as logged out).
 */
export function isSameSiteRequest(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!host) return false;
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    if (originHost === host) return true;

    const key = (h: string): string | null => {
      try {
        const url = new URL(`http://${h}`);
        const name = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
        const port = url.port;
        const loop =
          name === "127.0.0.1" ||
          name === "localhost" ||
          name === "::1" ||
          name === "0:0:0:0:0:0:0:1";
        if (loop) return `__dev_loopback__:${port}`;
        return `${name}:${port}`;
      } catch {
        return null;
      }
    };

    const ok = key(originHost) !== null && key(originHost) === key(host);
    return ok;
  } catch {
    return false;
  }
}
