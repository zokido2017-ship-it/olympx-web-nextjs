import { ensureCreateSession } from "@/lib/olympx/ensure-create-session";

/** Resolve bearer token for authenticated create flows (org, team, etc.). */
export async function resolveCreateClientToken(
  explicit?: string | null,
): Promise<string | null> {
  const { token } = await ensureCreateSession(explicit);
  return token;
}
