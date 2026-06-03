import {
  isOlympxManagementHubPath,
  shouldEnforceOlympxAuth,
} from "@/lib/olympx/auth-enforced-paths";

/**
 * Set `NEXT_PUBLIC_OLYMPX_AUTH_BYPASS=true` in `.env.local` to relax auth on
 * non-hub routes only. Management hub paths (/organizations, /teams, etc.)
 * always require a session so create/list flows do not run without a token.
 */
export function isOlympxAuthBypassed(): boolean {
  return process.env.NEXT_PUBLIC_OLYMPX_AUTH_BYPASS === "true";
}

/** True when this path may skip OTP enforcement (bypass flag + not a hub route). */
export function isOlympxAuthBypassedForPath(pathname: string): boolean {
  return isOlympxAuthBypassed() && !shouldEnforceOlympxAuth(pathname);
}

/**
 * TODO: Restore proper authentication — remove this dev bypass.
 * When true, skip HTTP session confirmation after OTP and allow management hub
 * routes with client-side token only (localStorage). Enabled in development by default;
 * set NEXT_PUBLIC_OLYMPX_DEV_SKIP_SESSION_CONFIRM=false to disable, or "true" to force on.
 */
export function isOlympxDevSessionConfirmBypassed(): boolean {
  const flag = process.env.NEXT_PUBLIC_OLYMPX_DEV_SKIP_SESSION_CONFIRM;
  if (flag === "false") return false;
  if (flag === "true") return true;
  return process.env.NODE_ENV === "development";
}

/** TODO: Restore proper authentication — remove alongside isOlympxDevSessionConfirmBypassed. */
export function isOlympxDevHubAccessBypassed(pathname: string): boolean {
  return (
    isOlympxDevSessionConfirmBypassed() && isOlympxManagementHubPath(pathname)
  );
}

/** @deprecated Use isOlympxManagementHubPath */
export function isOlympxDevOrgAccessPath(pathname: string): boolean {
  return (
    pathname === "/organizations" || pathname.startsWith("/organizations/")
  );
}

/** @deprecated Use isOlympxDevHubAccessBypassed */
export function isOlympxDevOrgAccessBypassed(pathname: string): boolean {
  return isOlympxDevHubAccessBypassed(pathname);
}

export { isOlympxManagementHubPath };
