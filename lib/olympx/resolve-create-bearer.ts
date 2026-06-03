import type { NextRequest } from "next/server";

import { readSessionTokenFromRequest } from "@/lib/olympx/session-store";

/** Resolve bearer token for authenticated Olympx API routes (server-side). */
export async function resolveOlympxApiBearer(
  req: NextRequest,
): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const fromHeader = authHeader.slice("Bearer ".length).trim();
    if (fromHeader) return fromHeader;
  }

  const custom = req.headers.get("x-olympx-access-token")?.trim();
  if (custom) return custom;

  const fromCookie = readSessionTokenFromRequest(req);
  if (fromCookie) return fromCookie;

  const service =
    process.env.OLYMPEX_ORG_CREATE_BEARER_TOKEN?.trim() ||
    process.env.OLYMPEX_API_BEARER_TOKEN?.trim();
  if (service) return service;

  return null;
}

/** @deprecated Use resolveOlympxApiBearer */
export const resolveOrganisationCreateBearer = resolveOlympxApiBearer;
