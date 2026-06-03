export type CreatedOrganisationRef = {
  slug: string;
  id?: string | number;
};

function readSlug(record: Record<string, unknown>): string | null {
  const slug = record.slug;
  if (typeof slug === "string" && slug.trim()) return slug.trim();
  return null;
}

/** Parse slug/id from varied Laravel create-organisation JSON shapes. */
export function extractOrganisationFromResponse(
  payload: Record<string, unknown>,
): CreatedOrganisationRef | null {
  const data = payload.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    const nested = d.organisation ?? d.organization;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const slug = readSlug(nested as Record<string, unknown>);
      if (slug) {
        const id = (nested as Record<string, unknown>).id;
        return {
          slug,
          id: typeof id === "string" || typeof id === "number" ? id : undefined,
        };
      }
    }
    const slug = readSlug(d);
    if (slug) {
      const id = d.id;
      return {
        slug,
        id: typeof id === "string" || typeof id === "number" ? id : undefined,
      };
    }
  }

  const topSlug = readSlug(payload);
  if (topSlug) {
    const id = payload.id;
    return {
      slug: topSlug,
      id: typeof id === "string" || typeof id === "number" ? id : undefined,
    };
  }

  return null;
}
