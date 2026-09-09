export type ApiUser = {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  contact_email?: string | null;
  slug?: string | null;
};

export type SendOtpRequest = {
  phone_code: string;
  mobile_number: string;
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
};

export type ValidateOtpResponse = {
  token?: string;
  access_token?: string;
  user?: ApiUser;
};

export type RegisterResponse = ApiUser;
