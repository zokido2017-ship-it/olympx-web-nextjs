/**
 * Management hub routing — sidebar + org profile shell detection.
 */

/** Default slug for primary org profile (nav + redirects). */
export const ORG_PROFILE_SLUG_DEFAULT = "olympx-elite";

/** Default slug for team profile link in sidebar. */
export const TEAM_PROFILE_SLUG_DEFAULT = "apex-vanguards";

const RESERVED_ORG_PROFILE_SEGMENTS = new Set([
  "create",
  "groups",
  "users",
  "roles",
  "onboarding",
  "super-admin",
  "analytics",
  "reports",
  "settings",
  "profile",
]);

const RESERVED_TEAM_PROFILE_SEGMENTS = new Set(["create", "stats", "schedule"]);

export function isDynamicOrganizationSlug(segment: string): boolean {
  return !RESERVED_ORG_PROFILE_SEGMENTS.has(segment);
}

export function isDynamicTeamSlug(segment: string): boolean {
  return !RESERVED_TEAM_PROFILE_SEGMENTS.has(segment);
}

/** True when the alternate Organization Profile chrome (full shell) should wrap the page. */
export function isOrganizationProfileShellPath(pathname: string): boolean {
  const m = pathname.match(/^\/organizations\/([^/]+)/);
  if (!m) return false;
  return isDynamicOrganizationSlug(m[1]);
}

/** True when pathname is a team profile page at /teams/[slug]. */
export function isTeamProfilePath(pathname: string): boolean {
  const m = pathname.match(/^\/teams\/([^/]+)/);
  if (!m) return false;
  return isDynamicTeamSlug(m[1]);
}

export function getOrganizationBasePath(slug: string): string {
  return `/organizations/${slug}`;
}

export function getTeamBasePath(slug: string): string {
  return `/teams/${slug}`;
}
