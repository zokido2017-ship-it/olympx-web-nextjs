import type { NextRequest } from "next/server";

const DEV_DEFAULT_BACKEND = "http://127.0.0.1:8000";

function backendBaseUrl(): string | null {
  const raw =
    process.env.OLYMPEX_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_OLYMPX_API_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "development") {
    return DEV_DEFAULT_BACKEND;
  }
  return null;
}

async function proxy(req: NextRequest, pathSegments: string[]): Promise<Response> {
  const base = backendBaseUrl();
  if (!base) {
    return Response.json(
      {
        message:
          "Backend URL not configured. Set OLYMPEX_API_BASE_URL (e.g. http://127.0.0.1:8000) in the environment or .env.local, then restart the server.",
      },
      { status: 503 },
    );
  }

  const subpath = pathSegments.join("/");
  const target = `${base}/${subpath}${req.nextUrl.search}`;

  const init: RequestInit = {
    method: req.method,
    cache: "no-store",
    headers: new Headers(),
  };

  const skip = new Set([
    "connection",
    "content-length",
    "host",
    "cookie",
    "keep-alive",
    "transfer-encoding",
    "upgrade",
  ]);

  req.headers.forEach((value, key) => {
    if (!skip.has(key.toLowerCase())) {
      (init.headers as Headers).set(key, value);
    }
  });

  if (req.method !== "GET" && req.method !== "HEAD") {
    const buf = await req.arrayBuffer();
    init.body = buf.byteLength ? buf : undefined;
  }

  const UPSTREAM_MS = 25_000;
  init.signal =
    typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
      ? AbortSignal.timeout(UPSTREAM_MS)
      : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    return Response.json(
      {
        message: `Could not reach API at ${base} within ${UPSTREAM_MS / 1000}s. Start Laravel (e.g. php artisan serve) and set OLYMPEX_API_BASE_URL in .env.local.`,
      },
      { status: 502 },
    );
  }

  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (
      key.toLowerCase() !== "content-encoding" &&
      key.toLowerCase() !== "transfer-encoding"
    ) {
      outHeaders.set(key, value);
    }
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}

type RouteCtx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { path = [] } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { path = [] } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  const { path = [] } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { path = [] } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { path = [] } = await ctx.params;
  return proxy(req, path);
}
