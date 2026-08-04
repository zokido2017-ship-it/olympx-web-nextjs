export type PlayerStatKey =
  | "matchesPlayed"
  | "totalWins"
  | "winRate"
  | "tournaments"
  | "medals"
  | "championships";

export type PlayerStat = {
  key: PlayerStatKey;
  label: string;
  value: string;
  helper?: string;
};

export type PlayerTeam = {
  id: string;
  name: string;
  sport: string;
  role: string;
  since: string;
};

export type PlayerActivity = {
  id: string;
  type: "match" | "training" | "tournament" | "award";
  title: string;
  detail: string;
  timestamp: string;
};

export type PlayerMatch = {
  id: string;
  opponent: string;
  tournament: string;
  date: string;
  result?: "win" | "loss" | "draw";
  score?: string;
  status: "completed" | "upcoming";
  sport: string;
};

export type PerformanceMetric = {
  label: string;
  value: number;
  max: number;
  unit?: string;
};

export type PlayerAchievement = {
  id: string;
  title: string;
  organization: string;
  year: string;
  category: string;
};

export type PlayerProfile = {
  id: string;
  slug: string;
  name: string;
  photoUrl?: string;
  location: string;
  profileCompletion: number;
  status: "active" | "inactive" | "in-season";
  statusLabel: string;
  sports: string[];
  summary: string;
  stats: PlayerStat[];
  teams: PlayerTeam[];
  recentActivity: PlayerActivity[];
  matches: PlayerMatch[];
  performance: PerformanceMetric[];
  achievements: PlayerAchievement[];
};
