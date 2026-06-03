import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  olympxBackendBaseUrl,
  olympxOrganisationsApiPath,
} from "@/lib/olympx/backend-base-url";
import { resolveOlympxApiBearer } from "@/lib/olympx/resolve-create-bearer";
import {
  olympxUpstreamFetch,
  upstreamFetchErrorMessage,
} from "@/lib/olympx/upstream-fetch";

/**
 * Authenticated create-organisation proxy.
 * Reads bearer token from Authorization, X-Olympx-Access-Token, session cookie,
 * or OLYMPEX_ORG_CREATE_BEARER_TOKEN (server env), then forwards to Laravel.
 */
export async function POST(req: NextRequest) {
  const token = await resolveOlympxApiBearer(req);
  if (!token) {
    return NextResponse.json(
      {
        message:
          "Unauthenticated. Sign in first, or set OLYMPEX_ORG_CREATE_BEARER_TOKEN in .env.local for local development.",
      },
      { status: 401 },
    );
  }

  const base = olympxBackendBaseUrl();
  if (!base) {
    return NextResponse.json(
      { message: "Backend URL not configured (OLYMPEX_API_BASE_URL)." },
      { status: 503 },
    );
  }

  const target = `${base}/${olympxOrganisationsApiPath()}`;
  const contentType = req.headers.get("content-type");
  const body = await req.arrayBuffer();

  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  if (contentType) headers.set("Content-Type", contentType);

  let upstream: Response;
  try {
    upstream = await olympxUpstreamFetch(target, {
      method: "POST",
      headers,
      body: body.byteLength > 0 ? body : undefined,
      cache: "no-store",
    });
  } catch (err) {
    return NextResponse.json(
      { message: upstreamFetchErrorMessage(base, err) },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  const outHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) outHeaders.set("Content-Type", upstreamType);

  return new NextResponse(text, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}
