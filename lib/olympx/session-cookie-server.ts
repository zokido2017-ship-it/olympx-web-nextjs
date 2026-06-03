import { cookies } from "next/headers";

import {
  decodeSessionCookieValue,
  encodeSessionCookieValue,
} from "@/lib/olympx/session-cookie-codec";
import { OLYMPX_ACCESS_TOKEN_KEY } from "@/lib/olympx/session-constants";
import { sessionCookieOptions } from "@/lib/olympx/session-store";

/** Set httpOnly session cookie (Route Handlers / Server Actions only). */
export async function setSessionCookie(token: string): Promise<void> {
  const encoded = encodeSessionCookieValue(token);
  const store = await cookies();
  store.set(OLYMPX_ACCESS_TOKEN_KEY, encoded, sessionCookieOptions());
}

export async function getSessionCookie(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(OLYMPX_ACCESS_TOKEN_KEY)?.value;
  const decoded = decodeSessionCookieValue(raw);
  return decoded?.trim() ? decoded.trim() : null;
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(OLYMPX_ACCESS_TOKEN_KEY);
}
