import { getApiOrigin } from "@/lib/api/config";
import {
  SPORTS_CATALOG,
  type SportCategory,
  type SportOption,
} from "@/constants/sports-catalog";
import type { ApiSport } from "@/types/api";

const CATEGORY_VALUES: SportCategory[] = ["indoor", "outdoor", "digital"];

function normalizeCategory(value: string | null | undefined): SportCategory | null {
  const normalized = (value ?? "").trim().toLowerCase();

  if (CATEGORY_VALUES.includes(normalized as SportCategory)) {
    return normalized as SportCategory;
  }

  if (normalized.includes("indoor")) return "indoor";
  if (
    normalized.includes("digital") ||
    normalized.includes("esport") ||
    normalized.includes("virtual")
  ) {
    return "digital";
  }
  if (normalized.includes("outdoor")) return "outdoor";

  return null;
}

function mapSportCategory(sport: ApiSport): SportCategory {
  const fromCategory = normalizeCategory(sport.category);
  if (fromCategory) return fromCategory;

  const fromCategoryName = normalizeCategory(sport.category_name);
  if (fromCategoryName) return fromCategoryName;

  const slug = sport.slug?.trim() || String(sport.id);
  const fallback = SPORTS_CATALOG.find(
    (item) => item.id === slug || item.name.toLowerCase() === sport.name.toLowerCase(),
  );

  return fallback?.category ?? "outdoor";
}

export function resolveSportIconUrl(sport: ApiSport): string {
  const iconUrl = sport.icon_url?.trim();
  if (iconUrl) {
    if (iconUrl.startsWith("http://") || iconUrl.startsWith("https://")) {
      return iconUrl;
    }

    if (iconUrl.startsWith("/")) {
      return `${getApiOrigin()}${iconUrl}`;
    }

    return `${getApiOrigin()}/${iconUrl}`;
  }

  const iconPath = sport.icon_path?.trim();
  if (iconPath) {
    if (iconPath.startsWith("http://") || iconPath.startsWith("https://")) {
      return iconPath;
    }

    if (iconPath.startsWith("/")) {
      return `${getApiOrigin()}${iconPath}`;
    }

    return `${getApiOrigin()}/${iconPath}`;
  }

  const slug = sport.slug?.trim() || String(sport.id);
  const local = SPORTS_CATALOG.find((item) => item.id === slug);
  return local?.iconSrc ?? `/sports/icons/${slug}.png`;
}

export function mapApiSportToOption(sport: ApiSport): SportOption {
  return {
    id: String(sport.id),
    name: sport.name,
    category: mapSportCategory(sport),
    iconSrc: resolveSportIconUrl(sport),
  };
}

export function mapApiSportsToOptions(sports: ApiSport[]): SportOption[] {
  return sports
    .filter((sport) => sport.is_active !== false)
    .map(mapApiSportToOption)
    .sort((a, b) => a.name.localeCompare(b.name));
}
