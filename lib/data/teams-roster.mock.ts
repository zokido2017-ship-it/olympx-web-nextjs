import type { ReactNode } from "react";

export type RosterTeamRow = {
  id: string;
  name: string;
  division: string;
  sport: "BASKETBALL" | "SOCCER" | "HOCKEY";
  playerCount: number;
  captainName: string;
  captainImage?: string;
  captainInitials: string;
  tournamentsRegistered: number;
  tournamentsTotal: number;
  createdLabel: string;
  logoGradient: string;
};

export const ROSTER_TOTAL = 48;

export const ROSTER_TEAM_ROWS: RosterTeamRow[] = [
  {
    id: "1",
    name: "Storm Riders",
    division: "Pacific Division",
    sport: "BASKETBALL",
    playerCount: 26,
    captainName: "Jordan Hale",
    captainInitials: "JH",
    captainImage:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop",
    tournamentsRegistered: 2,
    tournamentsTotal: 3,
    createdLabel: "Jan 12, 2025",
    logoGradient: "from-violet-500 to-indigo-600",
  },
  {
    id: "2",
    name: "Harbor City FC",
    division: "West Coast League",
    sport: "SOCCER",
    playerCount: 32,
    captainName: "Sofia Martins",
    captainInitials: "SM",
    captainImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
    tournamentsRegistered: 3,
    tournamentsTotal: 3,
    createdLabel: "Feb 3, 2025",
    logoGradient: "from-sky-500 to-blue-700",
  },
  {
    id: "3",
    name: "Northern Wolves",
    division: "Elite North",
    sport: "HOCKEY",
    playerCount: 24,
    captainName: "Chris Nolan",
    captainInitials: "CN",
    tournamentsRegistered: 1,
    tournamentsTotal: 4,
    createdLabel: "Mar 18, 2025",
    logoGradient: "from-slate-600 to-slate-800",
  },
];

export function sportBadgeIcon(sport: RosterTeamRow["sport"]): ReactNode {
  switch (sport) {
    case "BASKETBALL":
      return "🏀";
    case "SOCCER":
      return "⚽";
    default:
      return "🏒";
  }
}
