import { getApiOrigin } from "@/lib/api/config";
import { apiClient } from "@/lib/api/client";
import type { ApiTeam, CreateTeamRequest, CreateTeamResponse } from "@/types/api";

function normalizeTeamsPayload(payload: unknown): ApiTeam[] {
  if (Array.isArray(payload)) {
    return payload as ApiTeam[];
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) {
      return record.data as ApiTeam[];
    }
    if (Array.isArray(record.teams)) {
      return record.teams as ApiTeam[];
    }
  }

  return [];
}

function extractCreatedTeam(response: CreateTeamResponse): ApiTeam {
  if (response.data && typeof response.data.id === "number") {
    return response.data;
  }
  if (response.team && typeof response.team.id === "number") {
    return response.team;
  }
  if (typeof response.id === "number") {
    return response as ApiTeam;
  }

  throw new Error("Team created but the API response was missing team details.");
}

export function resolveTeamLogoUrl(team: ApiTeam): string | null {
  const logoUrl = team.logo_url?.trim();
  if (logoUrl) {
    if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
      return logoUrl;
    }
    return logoUrl.startsWith("/")
      ? `${getApiOrigin()}${logoUrl}`
      : `${getApiOrigin()}/${logoUrl}`;
  }

  const logoPath = team.logo_path?.trim();
  if (!logoPath) return null;

  if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) {
    return logoPath;
  }

  return logoPath.startsWith("/")
    ? `${getApiOrigin()}${logoPath}`
    : `${getApiOrigin()}/${logoPath}`;
}

export function getTeamSportLabel(team: ApiTeam): string {
  return team.sport?.name?.trim() || "—";
}

/** @deprecated Use `fetchMyTeams(playerId)` — requires the authenticated player's id. */
export async function fetchTeams(): Promise<ApiTeam[]> {
  const { data } = await apiClient.get<unknown>("/teams");
  return normalizeTeamsPayload(data);
}

export async function fetchMyTeams(playerId: number): Promise<ApiTeam[]> {
  const { data } = await apiClient.get<unknown>("/teams/myteams", {
    params: { player_id: playerId },
  });
  return normalizeTeamsPayload(data);
}

function extractTeam(payload: unknown): ApiTeam | null {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  if (record.data && typeof record.data === "object") {
    return record.data as ApiTeam;
  }
  if (typeof record.id === "number") {
    return record as ApiTeam;
  }

  return null;
}

export async function fetchTeamById(teamId: number): Promise<ApiTeam> {
  const { data } = await apiClient.get<unknown>(`/teams/${teamId}`);
  const team = extractTeam(data);
  if (!team) {
    throw new Error("Team not found.");
  }
  return team;
}

export async function createTeam(payload: CreateTeamRequest): Promise<ApiTeam> {
  const { data } = await apiClient.post<CreateTeamResponse>("/teams", payload);
  return extractCreatedTeam(data);
}
