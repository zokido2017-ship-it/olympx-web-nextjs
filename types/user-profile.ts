export const GENDER_OPTIONS = ["male", "female", "other"] as const;

export type Gender = (typeof GENDER_OPTIONS)[number];

/** Users table and related docs */
export type StoredAuthProvider =
  | "email"
  | "google.com"
  | "phone"
  | "registration";

export type UserProfileDoc = {
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  createdAt: unknown;
  updatedAt: unknown;
  authProvider: StoredAuthProvider;
};
