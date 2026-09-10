import { getApiOrigin } from "@/lib/api/config";
import {
  SPORTS_CATALOG,
  type SportCategory,
  type SportOption,
} from "@/constants/sports-catalog";
import type { ApiSport } from "@/types/api";

function mapSportCategory(
  type: string | null | undefined,
  slug: string,
): SportCategory {
  const normalized = (type ?? "").toLowerCase();

  if (normalized.includes("indoor")) return "indoor";
  if (
    normalized.includes("digital") ||
    normalized.includes("esport") ||
    normalized.includes("virtual")
  ) {
    return "digital";
  }
  if (normalized.includes("outdoor")) return "outdoor";

  const fallback = SPORTS_CATALOG.find(
    (sport) => sport.id === slug || sport.name.toLowerCase() === slug,
  );

  return fallback?.category ?? "outdoor";
}

export function resolveSportIconUrl(
  iconPath: string | null | undefined,
  slug: string,
): string {
  if (iconPath?.trim()) {
    const value = iconPath.trim();
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }

    if (value.startsWith("/")) {
      return `${getApiOrigin()}${value}`;
    }

    return `${getApiOrigin()}/${value}`;
  }

  const local = SPORTS_CATALOG.find((sport) => sport.id === slug);
  return local?.iconSrc ?? `/sports/icons/${slug}.png`;
}

export function mapApiSportToOption(sport: ApiSport): SportOption {
  const slug = sport.slug?.trim() || String(sport.id);

  return {
    id: String(sport.id),
    name: sport.name,
    category: mapSportCategory(sport.type, slug),
    iconSrc: resolveSportIconUrl(sport.icon_path, slug),
  };
}

export function mapApiSportsToOptions(sports: ApiSport[]): SportOption[] {
  return sports
    .filter((sport) => sport.is_active !== false)
    .map(mapApiSportToOption)
    .sort((a, b) => a.name.localeCompare(b.name));
}
