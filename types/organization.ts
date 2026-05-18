export type OrganizationStatus = "active" | "archived";

export type OrganizationKind = "club" | "league" | "federation" | "brand";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  kind: OrganizationKind;
  description: string;
  status: OrganizationStatus;
  memberCount: number;
  createdAt: string;
  city: string;
};
