import { apiClient } from "@/lib/api/client";
import { getAuthToken } from "@/lib/auth-session";
import { splitFullName } from "@/lib/phone";
import { fetchCurrentUser } from "@/services/auth-api.service";
import type {
  ApiPlayer,
  ApiUser,
  CreatePlayerRequest,
  PlayerProfileJson,
  UpdatePlayerRequest,
} from "@/types/api";

function normalizePlayersPayload(payload: unknown): ApiPlayer[] {
  if (Array.isArray(payload)) {
    return payload as ApiPlayer[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: ApiPlayer[] }).data;
  }

  return [];
}

export async function listPlayers(): Promise<ApiPlayer[]> {
  const { data } = await apiClient.get<unknown>("/players");
  return normalizePlayersPayload(data);
}

export async function getPlayer(playerId: number): Promise<ApiPlayer> {
  const { data } = await apiClient.get<ApiPlayer>(`/players/${playerId}`);
  return data;
}

export async function createPlayer(
  payload: CreatePlayerRequest,
): Promise<ApiPlayer> {
  const { data } = await apiClient.post<ApiPlayer>("/players", payload);
  return data;
}

export async function updatePlayer(
  playerId: number,
  payload: UpdatePlayerRequest,
): Promise<ApiPlayer> {
  const { data } = await apiClient.put<ApiPlayer>(`/players/${playerId}`, payload);
  return data;
}

export async function findPlayerForUser(userId: number): Promise<ApiPlayer | null> {
  const players = await listPlayers();
  return players.find((player) => player.user_id === userId) ?? null;
}

export type PlayerWizardPersonalFields = {
  fullName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  photoPath?: string | null;
};

export type PlayerWizardFitnessFields = {
  height: string;
  weight: string;
  connections: Record<string, "connected" | "disconnected">;
};

export function buildPlayerProfileJson({
  sportIds,
  fitness,
  setupStep,
  profileComplete,
}: {
  sportIds: string[];
  fitness: PlayerWizardFitnessFields;
  setupStep: number;
  profileComplete: boolean;
}): PlayerProfileJson {
  return {
    sport_ids: sportIds
      .map((id) => Number.parseInt(id, 10))
      .filter((id) => Number.isFinite(id)),
    height: fitness.height || undefined,
    weight: fitness.weight || undefined,
    fitness_connections: fitness.connections,
    setup_step: setupStep,
    profile_complete: profileComplete,
  };
}

function personalFieldsToPlayerPayload(
  personal: PlayerWizardPersonalFields,
  userId: number,
  profile: PlayerProfileJson,
): CreatePlayerRequest {
  const names = splitFullName(personal.fullName);

  return {
    user_id: userId,
    first_name: names.first_name,
    last_name: names.last_name,
    display_name: personal.fullName.trim() || names.first_name,
    contact_email: personal.email || undefined,
    dob: personal.dateOfBirth || undefined,
    gender: personal.gender || undefined,
    nationality: personal.nationality || undefined,
    photo_path: personal.photoPath || undefined,
    profile,
  };
}

export async function loadAuthenticatedUser(): Promise<ApiUser | null> {
  try {
    return await fetchCurrentUser();
  } catch {
    return null;
  }
}

export function canPersistPlayerProfile(): boolean {
  return Boolean(getAuthToken());
}

export async function ensurePlayerForUser(
  user: ApiUser,
  personal: PlayerWizardPersonalFields,
  profile: PlayerProfileJson,
  existingPlayerId?: number | null,
): Promise<ApiPlayer> {
  if (existingPlayerId) {
    try {
      return await getPlayer(existingPlayerId);
    } catch {
      /* fall through */
    }
  }

  const existing = await findPlayerForUser(user.id);
  if (existing) {
    return existing;
  }

  return createPlayer(personalFieldsToPlayerPayload(personal, user.id, profile));
}

export async function savePlayerWizardStep({
  playerId,
  user,
  personal,
  sportIds,
  fitness,
  setupStep,
  profileComplete,
}: {
  playerId?: number | null;
  user?: ApiUser | null;
  personal: PlayerWizardPersonalFields;
  sportIds: string[];
  fitness: PlayerWizardFitnessFields;
  setupStep: number;
  profileComplete: boolean;
}): Promise<ApiPlayer | null> {
  if (!canPersistPlayerProfile()) {
    return null;
  }

  const resolvedUser = user ?? (await loadAuthenticatedUser());
  if (!resolvedUser) {
    return null;
  }
  const profile = buildPlayerProfileJson({
    sportIds,
    fitness,
    setupStep,
    profileComplete,
  });

  const player = await ensurePlayerForUser(resolvedUser, personal, profile, playerId);

  return updatePlayer(player.id, {
    first_name: splitFullName(personal.fullName).first_name,
    last_name: splitFullName(personal.fullName).last_name,
    display_name: personal.fullName.trim() || player.display_name || undefined,
    contact_email: personal.email || undefined,
    dob: personal.dateOfBirth || undefined,
    gender: personal.gender || undefined,
    nationality: personal.nationality || undefined,
    photo_path: personal.photoPath || undefined,
    profile,
    is_active: true,
  });
}

export function applyPlayerToWizardState(player: ApiPlayer): {
  personal: PlayerWizardPersonalFields;
  sportIds: string[];
  fitness: PlayerWizardFitnessFields;
  setupStep: number;
} {
  const profile = player.profile ?? {};
  const fullName =
    player.display_name ||
    [player.first_name, player.last_name].filter(Boolean).join(" ").trim();

  return {
    personal: {
      fullName,
      email: player.contact_email ?? "",
      dateOfBirth: player.dob?.slice(0, 10) ?? "",
      nationality: player.nationality ?? "",
      gender: player.gender ?? "",
      photoPath: player.photo_path ?? null,
    },
    sportIds: (profile.sport_ids ?? []).map(String),
    fitness: {
      height: profile.height ?? "",
      weight: profile.weight ?? "",
      connections: profile.fitness_connections ?? {
        apple: "disconnected",
        google: "disconnected",
        fitbit: "disconnected",
      },
    },
    setupStep: profile.setup_step ?? 1,
  };
}
