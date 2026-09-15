export type ApiUser = {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  contact_email?: string | null;
  slug?: string | null;
  player?: ApiPlayer | null;
};

export type PlayerProfileJson = {
  sport_ids?: number[];
  height?: string;
  weight?: string;
  fitness_connections?: Record<string, "connected" | "disconnected">;
  setup_step?: number;
  profile_complete?: boolean;
};

export type ApiPlayer = {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  dob?: string | null;
  gender?: string | null;
  nationality?: string | null;
  photo_path?: string | null;
  contact_email?: string | null;
  profile?: PlayerProfileJson | null;
  user_id?: number | null;
  is_active?: boolean | null;
};

export type ApiSport = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  sport_category_id?: number | null;
  category?: string | null;
  category_name?: string | null;
  type?: string | null;
  icon_url?: string | null;
  icon_path?: string | null;
  is_active?: boolean | null;
};

export type CreatePlayerRequest = {
  user_id: number;
  first_name: string;
  last_name: string;
  display_name?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  photo_path?: string;
  contact_email?: string;
  profile?: PlayerProfileJson | null;
};

export type UpdatePlayerRequest = Partial<CreatePlayerRequest> & {
  is_active?: boolean;
};

export type SendOtpRequest = {
  phone_code: string;
  mobile_number: string;
};

export type SendOtpResponse = {
  message?: string;
  registered?: boolean;
  player_exists?: boolean;
  player_exist?: boolean;
};

export type ValidateOtpRequest = SendOtpRequest & {
  otp: string;
};

export type RegisterRequest = {
  phone_code: string;
  mobile_number: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  contact_email?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  photo_path?: string;
  profile?: PlayerProfileJson | null;
};

export type ValidateOtpResponse = {
  message?: string;
  registered?: boolean;
  player_exists?: boolean;
  token?: string;
  access_token?: string;
  auth_code?: string;
  auth_token?: string;
  token_type?: string;
  expires_at?: string;
  user?: ApiUser;
  player?: ApiPlayer;
};

export type RegisteredPlayerSport = {
  id: number;
  name: string;
  slug: string;
  type?: string | null;
  icon_url?: string | null;
};

export type RegisteredPlayer = {
  id: number;
  display_name?: string | null;
  slug?: string | null;
  phone_code?: string | null;
  mobile_number?: string | null;
  height_cm?: string | number | null;
  weight_kg?: string | number | null;
  dob?: string | null;
  gender?: string | null;
  nationality?: string | null;
  contact_email?: string | null;
  photo_url?: string | null;
  connected_app?: string | null;
  ids?: number[];
  sports?: RegisteredPlayerSport[];
};

export type RegisterPlayerRequest = {
  phone_code: string;
  mobile_number: string;
  display_name: string;
  contact_email?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  height_cm?: number;
  weight_kg?: number;
  sportIds: number[];
  connected_app?: string;
  photo?: File | null;
};

export type RegisterPlayerResponse = {
  message?: string;
  player: RegisteredPlayer;
};

/** @deprecated Legacy JSON register response. */
export type RegisterResponse = ApiUser;

export type ApiTeam = {
  id: number;
  name: string;
  short_name?: string | null;
  description?: string | null;
  sport_id?: number | null;
  sport?: Pick<ApiSport, "id" | "name" | "slug"> | null;
  logo_path?: string | null;
  logo_url?: string | null;
  founded_year?: number | null;
  is_active?: boolean | null;
  is_created_by_player?: boolean | null;
  player_id?: number[] | null;
  members_count?: number | null;
  players_count?: number | null;
  created_at?: string | null;
};

export type CreateTeamRequest = {
  player_id: number[];
  name: string;
  sport_id?: number;
  description?: string;
  founded_year?: number;
  metadata?: unknown[] | null;
};

export type CreateTeamResponse = {
  message?: string;
  data?: ApiTeam;
  team?: ApiTeam;
} & Partial<ApiTeam>;
