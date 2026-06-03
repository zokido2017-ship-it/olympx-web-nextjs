import { cookies } from "next/headers";

import { decodeSessionCookieValue } from "@/lib/olympx/session-cookie-codec";
import { OLYMPX_ACCESS_TOKEN_KEY } from "@/lib/olympx/session-constants";

/** Read httpOnly session cookie on the server (matches middleware). */
export async function readServerHasOlympxSession(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(OLYMPX_ACCESS_TOKEN_KEY)?.value;
  return Boolean(decodeSessionCookieValue(raw)?.trim());
}
