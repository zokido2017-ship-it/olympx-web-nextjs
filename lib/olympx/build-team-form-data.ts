export type CreateTeamInput = {
  organisationId: number;
  name: string;
  sportId?: number | null;
  shortName?: string;
  logoFile?: File | null;
  captainPlayerId?: string | null;
};

export type CreateTeamPayload = {
  json: Record<string, unknown>;
  formData: FormData | null;
};

function shortNameFromTeamName(name: string): string {
  const compact = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (compact.length >= 3) return compact.slice(0, 16);
  return name.trim().slice(0, 16).toUpperCase();
}

export function buildCreateTeamPayload(input: CreateTeamInput): CreateTeamPayload {
  const json: Record<string, unknown> = {
    organisation_id: input.organisationId,
    name: input.name.trim(),
    short_name: input.shortName?.trim() || shortNameFromTeamName(input.name),
  };

  if (input.sportId != null && Number.isFinite(input.sportId)) {
    json.sport_id = input.sportId;
  }

  const metadata: Record<string, string> = {};
  if (input.captainPlayerId?.trim()) {
    metadata.captain_player_id = input.captainPlayerId.trim();
  }
  if (Object.keys(metadata).length > 0) {
    json.metadata = metadata;
  }

  if (!input.logoFile) {
    return { json, formData: null };
  }

  const formData = new FormData();
  formData.append("organisation_id", String(input.organisationId));
  formData.append("name", input.name.trim());
  formData.append(
    "short_name",
    input.shortName?.trim() || shortNameFromTeamName(input.name),
  );
  if (input.sportId != null && Number.isFinite(input.sportId)) {
    formData.append("sport_id", String(input.sportId));
  }
  if (Object.keys(metadata).length > 0) {
    formData.append("metadata", JSON.stringify(metadata));
  }
  formData.append("logo", input.logoFile);
  formData.append("logo_image", input.logoFile);

  return { json, formData };
}
