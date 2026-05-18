import { authDebug } from "@/lib/olympx/auth-debug";

const SESSION_API = "/api/auth/olympx-session";

/** True when the app session cookie exists (middleware-aligned). */
export async function checkOlympxServerSession(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch(SESSION_API, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return res.ok;
  } catch (e) {
    authDebug("sync-server", "GET olympx-session error", {
      error: e instanceof Error ? e.message : String(e),
    });
    return false;
  }
}

/** Sets session cookie via Route Handler so middleware & RSC see it on the next request (same cookie readable in JS for guards). */
export async function syncOlympxSessionToServer(token: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const trimmed = token.trim();
  if (!trimmed) return false;
  try {
    const res = await fetch(SESSION_API, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ token: trimmed }),
    });
    const ok = res.ok;
    authDebug("sync-server", ok ? "POST olympx-session succeeded" : "POST olympx-session failed", {
      status: res.status,
    });
    if (!ok) {
      const bodySnippet = await res.text().catch(() => "");
      authDebug("sync-server", "POST error body", {
        snippet: bodySnippet.slice(0, 200),
      });
    }
    return ok;
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    authDebug("sync-server", "POST olympx-session error", { error: raw });
    return false;
  }
}

export async function clearOlympxSessionOnServer(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch(SESSION_API, {
      method: "DELETE",
      credentials: "include",
    });
    authDebug("sync-server", "DELETE olympx-session", { status: res.status });
  } catch (e) {
    authDebug("sync-server", "DELETE olympx-session error", {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
