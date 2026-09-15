import { apiClient } from "@/lib/api/client";
import { mapApiSportsToOptions } from "@/lib/sports/map-api-sport";
import { SPORTS_CATALOG, type SportOption } from "@/constants/sports-catalog";
import type { ApiSport } from "@/types/api";

function normalizeSportsPayload(payload: unknown): ApiSport[] {
  if (Array.isArray(payload)) {
    return payload as ApiSport[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: ApiSport[] }).data;
  }

  return [];
}

export type FetchSportsResult = {
  sports: SportOption[];
  source: "api" | "fallback";
};

export async function fetchSportsFromApi(): Promise<FetchSportsResult> {
  const { data } = await apiClient.get<unknown>("/sports");
  const sports = normalizeSportsPayload(data);

  if (sports.length === 0) {
    return { sports: SPORTS_CATALOG, source: "fallback" };
  }

  return { sports: mapApiSportsToOptions(sports), source: "api" };
}
