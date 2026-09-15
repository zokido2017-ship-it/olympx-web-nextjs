import {
  safeLocalGetItem,
  safeLocalRemoveItem,
  safeLocalSetItem,
} from "@/lib/safe-storage";
import type { StoredTeam, TeamDraft } from "@/types/team";

const TEAMS_STORAGE_KEY = "sportxo_my_teams";
const TEAM_DRAFT_STORAGE_KEY = "sportxo_team_draft";

function readTeams(): StoredTeam[] {
  const raw = safeLocalGetItem(TEAMS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as StoredTeam[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTeams(teams: StoredTeam[]): void {
  safeLocalSetItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
}

export function getMyTeams(): StoredTeam[] {
  return readTeams().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getTeamById(teamId: string): StoredTeam | null {
  return readTeams().find((team) => team.id === teamId) ?? null;
}

export function saveTeam(team: StoredTeam): void {
  const teams = readTeams();
  const index = teams.findIndex((entry) => entry.id === team.id);

  if (index >= 0) {
    teams[index] = team;
  } else {
    teams.push(team);
  }

  writeTeams(teams);
}

export function createTeamId(): string {
  return `team_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function readTeamDraft(): TeamDraft | null {
  const raw = safeLocalGetItem(TEAM_DRAFT_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TeamDraft;
  } catch {
    return null;
  }
}

export function writeTeamDraft(draft: TeamDraft): void {
  safeLocalSetItem(TEAM_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function clearTeamDraft(): void {
  safeLocalRemoveItem(TEAM_DRAFT_STORAGE_KEY);
}
