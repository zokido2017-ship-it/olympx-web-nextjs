import {
  Activity,
  Building2,
  Calendar,
  CircleDot,
  LayoutDashboard,
  Medal,
  Trophy,
  Users,
  Video,
} from "lucide-react";

import type { AthleteDashboardData, DashboardNavItem } from "@/types/athlete-dashboard";

export const ATHLETE_DASHBOARD_NAV: DashboardNavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "matches", label: "Matches", icon: CircleDot },
  { id: "stats", label: "Stats", icon: Activity },
  { id: "ranking", label: "Ranking", icon: Medal },
  { id: "media", label: "Media", icon: Video },
  { id: "teams", label: "Teams", icon: Users },
  { id: "organizations", label: "Organization", icon: Building2 },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "sponsorship", label: "Sponsorship", icon: Calendar },
];

/** Static mock payload — swap for API / CMS later. */
export const athleteDashboardMock: AthleteDashboardData = {
  brand: "Olympx",
  sidebarTagline: ["Elite", "Performance"],
  athlete: {
    name: "Marcus Thorne",
    subtitle: "Forward · Apex Vanguards · Regional League",
    avatarSrc:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&q=80",
    coverSrc:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&q=80",
  },
  navItems: ATHLETE_DASHBOARD_NAV,
  defaultNavId: "overview",
  sports: [
    { id: "soccer", label: "Soccer", emoji: "⚽" },
    { id: "basketball", label: "Basketball", emoji: "🏀" },
  ],
  activeSportId: "soccer",
  stats: [
    {
      id: "matches",
      kind: "default",
      label: "Total Matches",
      value: "124",
      emoji: "⚽",
    },
    {
      id: "wins",
      kind: "default",
      label: "Wins",
      value: "82",
      accent: "+4 this season",
    },
    {
      id: "medals",
      kind: "medals",
      label: "Medals",
      value: "15",
    },
    {
      id: "lastMatch",
      kind: "lastMatch",
      label: "Last Match Played",
      sublabel: "Won 4-1 vs Titans",
      accent: "Soccer · Regional League",
    },
  ],
  aiInsights: {
    title: "AI Performance Insights",
    description: "Elite stamina recovery detected in recent sessions.",
    badge: "Trending Up",
    body: "Maintain current load through the next micro-cycle for peak match readiness. Coaching analytics flag sustained output in final thirds without HR drift.",
    recoveryLabel: "Recovery Rate",
    recoveryPercent: 94,
    recoveryCaption: "94% Optimal",
  },
  sponsors: [
    { id: "nike", name: "NIKE" },
    { id: "redbull", name: "RED BULL" },
  ],
  teams: [
    {
      id: "apex",
      initials: "AV",
      name: "Apex Vanguards",
      role: "Primary · Forward",
      variant: "primary",
    },
    {
      id: "sf",
      initials: "SF",
      name: "SF United",
      role: "Secondary · Winger",
      variant: "secondary",
    },
  ],
  trophies: [
    { id: "boot", title: "Golden Boot '23", tone: "gold" },
    { id: "mvp", title: "Reg. Finals MVP", tone: "silver" },
  ],
  activity: [
    {
      id: "a1",
      dateLabel: "2 Days Ago",
      title: "Match Victory vs. Coastal Elite",
      description:
        "Two goals in the second half and a full 90 minutes — dominant positioning and late-game endurance highlighted by coaching staff.",
      tone: "recent",
    },
    {
      id: "a2",
      dateLabel: "1 Week Ago",
      title: "Training Milestone: Agility Drill",
      description:
        "Beat previous shuttle-run PR by 4%. Focus stays on lateral acceleration through taper week.",
      tone: "older",
    },
  ],
};
