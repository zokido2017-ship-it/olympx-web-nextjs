export const AUTH_FLOW_DEBUG =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_AUTH_DEBUG === "1";

/** Structured auth tracing (browser + server when imported). Use NEXT_PUBLIC_AUTH_DEBUG=1 in prod. */
export function authDebug(
  scope: string,
  message: string,
  extra?: Record<string, unknown>,
): void {
  if (!AUTH_FLOW_DEBUG) return;
  const tag = `[auth-flow:${scope}]`;
  if (extra !== undefined) {
    console.log(`${tag} ${message}`, extra);
  } else {
    console.log(`${tag} ${message}`);
  }
}

export function authDebugMaskToken(token: string): string {
  if (token.length <= 8) return "[redacted]";
  return `${token.slice(0, 4)}…${token.slice(-4)} (len=${token.length})`;
}
