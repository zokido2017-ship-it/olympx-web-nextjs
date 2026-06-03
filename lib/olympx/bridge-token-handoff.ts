import { authDebug, authDebugMaskToken } from "@/lib/olympx/auth-debug";
import {
  safeSessionStorageGet,
  safeSessionStorageRemove,
  safeSessionStorageSet,
} from "@/lib/safe-web-storage";

/** One-hop token carry: login → session-bridge (survives full document navigation). */
export const BRIDGE_TOKEN_KEY = "olympx_bridge_token";

const BRIDGE_RUN_LOCK_KEY = "olympx_bridge_run_lock";

export function stageBridgeToken(token: string): void {
  const trimmed = token.trim();
  if (!trimmed) return;
  const ok = safeSessionStorageSet(BRIDGE_TOKEN_KEY, trimmed);
  authDebug("bridge-handoff", "stage token", {
    ok,
    token: authDebugMaskToken(trimmed),
  });
}

export function peekStagedBridgeToken(): string | null {
  const staged = safeSessionStorageGet(BRIDGE_TOKEN_KEY)?.trim();
  return staged || null;
}

export function clearStagedBridgeToken(): void {
  safeSessionStorageRemove(BRIDGE_TOKEN_KEY);
}

/** @deprecated Prefer peekStagedBridgeToken — early consume breaks React Strict Mode double-mount. */
export function consumeStagedBridgeToken(): string | null {
  const staged = peekStagedBridgeToken();
  if (!staged) return null;
  clearStagedBridgeToken();
  authDebug("bridge-handoff", "consumed staged bridge token", {
    token: authDebugMaskToken(staged),
  });
  return staged;
}

/** Prevent duplicate bridge runs when React Strict Mode remounts the page. */
export function acquireBridgeRunLock(): boolean {
  if (safeSessionStorageGet(BRIDGE_RUN_LOCK_KEY) === "1") {
    authDebug("bridge-handoff", "bridge run lock held — skipping duplicate effect", {});
    return false;
  }
  safeSessionStorageSet(BRIDGE_RUN_LOCK_KEY, "1");
  return true;
}

export function releaseBridgeRunLock(): void {
  safeSessionStorageRemove(BRIDGE_RUN_LOCK_KEY);
}
