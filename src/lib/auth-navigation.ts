import {
  clearPlayerProfileComplete,
  markAuthenticated,
  PLAYER_PROFILE_PATH,
  getPostLoginPath,
} from "@/lib/auth-session";

/**
 * Toggle for UI-only auth routing during development.
 * Set to `false` when connecting real login/register APIs.
 */
export const USE_MOCK_AUTH_NAVIGATION = false;

/**
 * UI dev: open `/player-profile` directly without login or profile checks.
 * Set to `false` to re-enable `RequirePlayerProfileAccess` (with API auth).
 */
export const BYPASS_PLAYER_PROFILE_ROUTE_GUARD = true;

/**
 * UI dev: "Sign up" on login goes straight to `/player-profile` (skip `/signup`).
 * Set to `false` when the register page and APIs are ready.
 */
export const BYPASS_SIGNUP_REGISTRATION = false;

/** Login footer "Sign up" target — register page or player profile (when bypassing). */
export function getSignupEntryPath(): string {
  return BYPASS_SIGNUP_REGISTRATION ? PLAYER_PROFILE_PATH : "/signup";
}

export type ClientAuthRouter = {
  push: (href: string) => void;
  replace?: (href: string) => void;
};

/**
 * Marks a local session and sends the user to the standalone player profile wizard.
 * Replace this with API-driven session + `getPostLoginPath()` when backend auth exists.
 */
export function completeMockAuthSession(
  router: ClientAuthRouter,
  options?: { replace?: boolean },
): void {
  markAuthenticated();
  clearPlayerProfileComplete();

  const target = PLAYER_PROFILE_PATH;
  if (options?.replace && router.replace) {
    router.replace(target);
    return;
  }
  router.push(target);
}

/**
 * Entry point after login/register succeeds — mock or real routing lives here.
 */
export function navigateAfterAuthSuccess(router: ClientAuthRouter): void {
  if (USE_MOCK_AUTH_NAVIGATION) {
    completeMockAuthSession(router);
    return;
  }

  router.push(getPostLoginPath());
}

/**
 * After registration completes — every user starts as a player and sets up
 * their profile. Teams and organisations are created later from the dashboard.
 */
export function navigateAfterSignupSuccess(router: ClientAuthRouter): void {
  markAuthenticated();
  clearPlayerProfileComplete();
  router.push(PLAYER_PROFILE_PATH);
}
