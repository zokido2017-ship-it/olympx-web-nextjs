export type DashboardUser = {
  name: string;
  role: string;
  /** Optional — shown in navbar/user areas when available. */
  email?: string;
  avatarUrl: string;
  /** Shown when image fails or is absent */
  initials: string;
};

export const DEFAULT_DASHBOARD_USER: DashboardUser = {
  name: "Account",
  role: "Member",
  email: "",
  avatarUrl: "",
  initials: "OX",
};
