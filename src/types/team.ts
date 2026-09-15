import type { TeamMemberRole } from "@/constants/create-team";

export type TeamStatus = "draft" | "created";

export type TeamMemberRecord = {
  id: string;
  initials: string;
  name: string;
  role: TeamMemberRole;
  phone: string;
  jerseyNumber?: string;
  avatarClassName: string;
};

export type StoredTeam = {
  id: string;
  name: string;
  sport: string;
  description?: string;
  logoPreviewUrl?: string | null;
  status: TeamStatus;
  createdAt: string;
  members: TeamMemberRecord[];
};

export type TeamDraft = {
  name: string;
  sport: string;
  description: string;
  logoPreviewUrl?: string | null;
};
