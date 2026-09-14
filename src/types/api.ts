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
  user?: ApiUser;
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
