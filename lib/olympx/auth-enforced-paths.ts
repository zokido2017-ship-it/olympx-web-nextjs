import { isPublicOrganisationAccessPath } from "@/lib/management-nav";

/** Management hub routes (organizations, teams, players). */
const MANAGEMENT_HUB_PREFIXES = [
  "/organizations",
  "/teams",
  "/players",
] as const;

export function isOlympxManagementHubPath(pathname: string): boolean {
  if (isPublicOrganisationAccessPath(pathname)) {
    return false;
  }
  return MANAGEMENT_HUB_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** App shell routes that always require a valid session cookie. */
const PROTECTED_PREFIXES = [
  "/organizations",
  "/teams",
  "/players",
  "/dashboard",
  "/profile",
] as const;

export function isOlympxAuthEnforcedPath(pathname: string): boolean {
  if (isPublicOrganisationAccessPath(pathname)) {
    return false;
  }
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Middleware and client guards require session when visiting protected app routes.
 * AUTH_BYPASS no longer disables OTP enforcement on the management hub (was a root
 * cause of “logged in” UI with no cookie → redirect loops).
 */
export function shouldEnforceOlympxAuth(pathname: string): boolean {
  return isOlympxAuthEnforcedPath(pathname);
}
