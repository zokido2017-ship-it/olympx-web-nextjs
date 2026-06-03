import { z } from "zod";

import { normalizeOrganisationSlug } from "@/lib/olympx/normalize-org-handle";

export const ORGANISATION_CATEGORIES = [
  "pro",
  "youth",
  "multi",
  "league",
] as const;

export type OrganisationCategory = (typeof ORGANISATION_CATEGORIES)[number];

export const createOrganisationSchema = z.object({
  orgName: z
    .string()
    .trim()
    .min(1, "Enter an organization name.")
    .max(255, "Name is too long."),
  handle: z
    .string()
    .trim()
    .min(1, "Choose a unique handle.")
    .max(255, "Handle is too long.")
    .refine((value) => normalizeOrganisationSlug(value).length > 0, {
      message: "Handle must contain at least one letter or number.",
    }),
  bio: z.string().max(5000, "Bio is too long.").optional(),
  category: z
    .string()
    .refine(
      (value): value is OrganisationCategory =>
        ORGANISATION_CATEGORIES.includes(value as OrganisationCategory),
      { message: "Select a category." },
    ),
  headquarters: z.string().max(255, "Location is too long.").optional(),
  website: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        !value ||
        /^https?:\/\/.+/i.test(value) ||
        /^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value),
      { message: "Enter a valid website URL." },
    ),
  twitter: z.string().max(64, "Handle is too long.").optional(),
  instagram: z.string().max(64, "Handle is too long.").optional(),
});

export type CreateOrganisationFormInput = z.infer<typeof createOrganisationSchema>;

export type CreateOrganisationFieldErrors = Partial<
  Record<keyof CreateOrganisationFormInput, string>
>;

/** Map Laravel validation keys → create form field keys. */
export function mapOrganisationApiFieldErrors(
  apiErrors: Record<string, string>,
): CreateOrganisationFieldErrors {
  const mapped: CreateOrganisationFieldErrors = {};
  for (const [key, message] of Object.entries(apiErrors)) {
    switch (key) {
      case "name":
        mapped.orgName = message;
        break;
      case "slug":
        mapped.handle = message;
        break;
      case "description":
        mapped.bio = message;
        break;
      case "website":
        mapped.website = message;
        break;
      case "category":
      case "settings.category":
        mapped.category = message;
        break;
      case "settings.location":
        mapped.headquarters = message;
        break;
      case "settings.twitter":
        mapped.twitter = message;
        break;
      case "settings.instagram":
        mapped.instagram = message;
        break;
      default:
        break;
    }
  }
  return mapped;
}

export function parseOlympxValidationErrors(
  body: unknown,
): Record<string, string> {
  if (!body || typeof body !== "object") return {};
  const errors = (body as Record<string, unknown>).errors;
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors)) {
    if (Array.isArray(value) && typeof value[0] === "string") {
      out[key] = value[0];
    } else if (typeof value === "string") {
      out[key] = value;
    }
  }
  return out;
}
