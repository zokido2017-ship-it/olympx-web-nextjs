/** Upstream timeout for Laravel API calls from Next.js route handlers (ms). */
const UPSTREAM_MS = Number(process.env.OLYMPEX_UPSTREAM_TIMEOUT_MS ?? 45000);

/**
 * Hop-by-hop and client-only headers that must not be forwarded to Laravel.
 * `Expect: 100-continue` (sent by PowerShell/curl) makes Node fetch fail with
 * "expect header not supported".
 */
const SKIP_UPSTREAM_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "cookie",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "te",
  "trailer",
  "expect",
  "proxy-connection",
  "proxy-authenticate",
  "proxy-authorization",
]);

export function shouldSkipUpstreamHeader(name: string): boolean {
  return SKIP_UPSTREAM_HEADERS.has(name.toLowerCase());
}

export function copyForwardableHeaders(
  source: Headers,
  target: Headers,
): void {
  source.forEach((value, key) => {
    if (!shouldSkipUpstreamHeader(key)) {
      target.set(key, value);
    }
  });
}

function upstreamFetchSignal(
  signal?: AbortSignal | null,
): AbortSignal | undefined {
  if (signal) return signal;
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(UPSTREAM_MS);
  }
  return undefined;
}

export function upstreamFetchErrorMessage(
  base: string,
  err: unknown,
): string {
  const message = err instanceof Error ? err.message : String(err);
  const cause =
    err instanceof Error && err.cause instanceof Error
      ? err.cause.message
      : "";
  const detail = cause || message;

  if (/expect header not supported/i.test(detail)) {
    return `Could not reach API at ${base}. Remove unsupported proxy headers (retry the request from the browser).`;
  }
  if (/timeout|timed out|abort/i.test(detail)) {
    return [
      `Could not reach API at ${base} within ${UPSTREAM_MS / 1000}s.`,
      "Ensure only one Laravel server is running on that port (stop duplicate `php artisan serve`, Docker, or WSL bindings on 8000).",
      "Set OLYMPEX_API_BASE_URL=http://127.0.0.1:8000 in .env.local and restart Next.js.",
    ].join(" ");
  }
  if (/econnrefused|connection refused|enotfound|econnreset|fetch failed/i.test(detail)) {
    return [
      `Could not connect to API at ${base}.`,
      "Start Laravel (`php artisan serve --host=127.0.0.1 --port=8000`) and verify OLYMPEX_API_BASE_URL in .env.local.",
      detail ? `(${detail})` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
  return `Could not reach API at ${base}: ${detail}`;
}

/** Server-side fetch to Laravel — avoids keep-alive issues with `php artisan serve`. */
export async function olympxUpstreamFetch(
  target: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has("connection")) {
    headers.set("Connection", "close");
  }

  const requestInit: RequestInit = {
    ...init,
    headers,
    cache: "no-store",
    signal: upstreamFetchSignal(init.signal),
  };

  let lastError: unknown;
  const attempts = 2;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fetch(target, requestInit);
    } catch (err) {
      lastError = err;
      const detail =
        err instanceof Error && err.cause instanceof Error
          ? err.cause.message
          : err instanceof Error
            ? err.message
            : String(err);
      const retryable =
        /timeout|timed out|abort|econnrefused|connection refused|econnreset|fetch failed/i.test(
          detail,
        );
      if (!retryable || i === attempts - 1) break;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw lastError;
}
