import type { NextRequest } from "next/server";

/** RSC / router prefetch must not receive 307→login or the app caches a false unauthenticated state. */
export function isAuthMiddlewarePrefetch(request: NextRequest): boolean {
  return (
    request.headers.get("Next-Router-Prefetch") === "1" ||
    request.headers.get("RSC") === "1" ||
    request.headers.get("Purpose") === "prefetch"
  );
}

export function middlewareRequestKind(request: NextRequest): string {
  if (isAuthMiddlewarePrefetch(request)) return "prefetch";
  const mode = request.headers.get("sec-fetch-mode");
  if (mode === "navigate") return "document";
  if (mode === "cors") return "fetch";
  return mode ?? "unknown";
}
