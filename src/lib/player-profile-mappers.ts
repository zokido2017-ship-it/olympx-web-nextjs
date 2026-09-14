import type { FitnessProvider } from "@/components/player-setup/fitness-information-section";

const GENDER_TO_API: Record<string, string> = {
  Male: "male",
  Female: "female",
  "Non-binary": "non_binary",
};

const NATIONALITY_TO_CODE: Record<string, string> = {
  india: "IN",
  indian: "IN",
  "united states": "US",
  usa: "US",
  "united kingdom": "GB",
  uk: "GB",
  australia: "AU",
  canada: "CA",
};

const CONNECTED_APP_SLUG: Record<FitnessProvider, string> = {
  apple: "apple_health",
  google: "google_fit",
  fitbit: "fitbit",
};

export function mapGenderToApi(gender: string): string | undefined {
  const trimmed = gender.trim();
  if (!trimmed || trimmed === "Prefer not to say") return undefined;
  return GENDER_TO_API[trimmed] ?? trimmed.toLowerCase().replace(/\s+/g, "_");
}

export function mapNationalityToApi(nationality: string): string | undefined {
  const trimmed = nationality.trim();
  if (!trimmed) return undefined;
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  return NATIONALITY_TO_CODE[trimmed.toLowerCase()];
}

export function parseMetricValue(value: string): number | undefined {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return undefined;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function resolveConnectedApp(
  connections: Record<FitnessProvider, "connected" | "disconnected">,
): string | undefined {
  for (const provider of Object.keys(CONNECTED_APP_SLUG) as FitnessProvider[]) {
    if (connections[provider] === "connected") {
      return CONNECTED_APP_SLUG[provider];
    }
  }
  return undefined;
}

export const PROFILE_PHOTO_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";
export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export function validateProfilePhoto(file: File): string | null {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return "Photo must be JPEG, PNG, or WebP.";
  }
  if (file.size > PROFILE_PHOTO_MAX_BYTES) {
    return "Photo must be 5 MB or smaller.";
  }
  return null;
}
