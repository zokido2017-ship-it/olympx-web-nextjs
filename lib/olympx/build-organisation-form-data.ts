import { normalizeOrganisationSlug } from "@/lib/olympx/normalize-org-handle";

export type CreateOrganisationInput = {
  name: string;
  handle: string;
  bio?: string;
  category: string;
  headquarters?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  /** Reserved for a future media upload API — not sent to POST /api/v1/organisations today. */
  logoFile?: File | null;
  bannerFile?: File | null;
};

/** Laravel POST /api/v1/organisations JSON body. */
export type CreateOrganisationJsonPayload = {
  name: string;
  slug: string;
  description?: string;
  website?: string;
  settings?: Record<string, string>;
};

function normalizeWebsite(raw?: string): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeSocialHandle(raw?: string): string | undefined {
  const trimmed = raw?.trim().replace(/^@+/, "");
  return trimmed || undefined;
}

function buildSettings(input: CreateOrganisationInput): Record<string, string> {
  const settings: Record<string, string> = {};
  if (input.category.trim()) settings.category = input.category.trim();
  if (input.headquarters?.trim()) settings.location = input.headquarters.trim();
  const twitter = normalizeSocialHandle(input.twitter);
  const instagram = normalizeSocialHandle(input.instagram);
  if (twitter) settings.twitter = twitter;
  if (instagram) settings.instagram = instagram;
  return settings;
}

/** Build JSON payload for Laravel `POST /api/v1/organisations`. */
export function buildCreateOrganisationPayload(
  input: CreateOrganisationInput,
): CreateOrganisationJsonPayload {
  const slug = normalizeOrganisationSlug(input.handle);
  const settings = buildSettings(input);

  const payload: CreateOrganisationJsonPayload = {
    name: input.name.trim(),
    slug,
  };

  if (input.bio?.trim()) payload.description = input.bio.trim();
  const website = normalizeWebsite(input.website);
  if (website) payload.website = website;
  if (Object.keys(settings).length > 0) payload.settings = settings;

  return payload;
}
