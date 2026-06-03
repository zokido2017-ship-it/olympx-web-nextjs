import { normalizeOrganisationSlug } from "@/lib/olympx/normalize-org-handle";

export type CreatedTeamRef = {
  slug: string;
  id?: string | number;
  name?: string;
};

function readSlug(record: Record<string, unknown>): string | null {
  const slug = record.slug;
  if (typeof slug === "string" && slug.trim()) return slug.trim();
  return null;
}

function slugFromName(name: string): string {
  return normalizeOrganisationSlug(name) || "team";
}

/** Parse slug/id from varied Laravel create-team JSON shapes. */
export function extractTeamFromResponse(
  payload: Record<string, unknown>,
  fallbackName?: string,
): CreatedTeamRef | null {
  const data = payload.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    const nested = d.team;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const t = nested as Record<string, unknown>;
      const slug = readSlug(t);
      const name = typeof t.name === "string" ? t.name : fallbackName;
      if (slug) {
        return {
          slug,
          id: typeof t.id === "string" || typeof t.id === "number" ? t.id : undefined,
          name,
        };
      }
      if (name) {
        return {
          slug: slugFromName(name),
          id: typeof t.id === "string" || typeof t.id === "number" ? t.id : undefined,
          name,
        };
      }
    }

    const slug = readSlug(d);
    const name = typeof d.name === "string" ? d.name : fallbackName;
    if (slug) {
      return {
        slug,
        id: typeof d.id === "string" || typeof d.id === "number" ? d.id : undefined,
        name,
      };
    }
    if (name) {
      return {
        slug: slugFromName(name),
        id: typeof d.id === "string" || typeof d.id === "number" ? d.id : undefined,
        name,
      };
    }
  }

  const topSlug = readSlug(payload);
  const topName =
    typeof payload.name === "string" ? payload.name : fallbackName;
  if (topSlug) {
    return {
      slug: topSlug,
      id:
        typeof payload.id === "string" || typeof payload.id === "number"
          ? payload.id
          : undefined,
      name: topName,
    };
  }
  if (topName) {
    return { slug: slugFromName(topName), name: topName };
  }

  if (fallbackName?.trim()) {
    return { slug: slugFromName(fallbackName), name: fallbackName.trim() };
  }

  return null;
}
