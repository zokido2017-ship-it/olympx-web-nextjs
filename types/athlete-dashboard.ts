import type { LucideIcon } from "lucide-react";

export type DashboardNavId =
  | "overview"
  | "matches"
  | "stats"
  | "ranking"
  | "media"
  | "teams"
  | "organizations"
  | "tournaments"
  | "sponsorship";

export type DashboardNavItem = {
  id: DashboardNavId;
  label: string;
  icon: LucideIcon;
};

export type SportTab = {
  id: string;
  label: string;
  emoji: string;
};

export type StatCardKind = "default" | "medals" | "lastMatch";

export type StatCardData = {
  id: string;
  kind: StatCardKind;
  label: string;
  value?: string;
  sublabel?: string;
  accent?: string;
  emoji?: string;
};

export type AiInsightsData = {
  title: string;
  description: string;
  badge: string;
  body: string;
  recoveryLabel: string;
  recoveryPercent: number;
  recoveryCaption: string;
};

export type SponsorItem = {
  id: string;
  name: string;
};

export type TeamItem = {
  id: string;
  initials: string;
  name: string;
  role: string;
  variant: "primary" | "secondary";
};

export type TrophyItem = {
  id: string;
  title: string;
  tone: "gold" | "silver";
};

export type ActivityItem = {
  id: string;
  dateLabel: string;
  title: string;
  description: string;
  tone: "recent" | "older";
};

export type AthleteDashboardData = {
  brand: string;
  sidebarTagline: [string, string];
  athlete: {
    name: string;
    subtitle: string;
    avatarSrc: string;
    coverSrc: string;
  };
  navItems: DashboardNavItem[];
  defaultNavId: DashboardNavId;
  sports: SportTab[];
  activeSportId: string;
  stats: StatCardData[];
  aiInsights: AiInsightsData;
  sponsors: SponsorItem[];
  teams: TeamItem[];
  trophies: TrophyItem[];
  activity: ActivityItem[];
};
