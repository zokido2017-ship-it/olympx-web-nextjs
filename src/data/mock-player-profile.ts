import type { PlayerProfile } from "@/types/player-profile";

export const MOCK_PLAYER_PROFILE: PlayerProfile = {
  id: "plr_001",
  slug: "arjun-mehta",
  name: "Arjun Mehta",
  photoUrl:
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f7f?auto=format&fit=crop&w=400&q=80",
  location: "Mumbai, India",
  profileCompletion: 86,
  status: "in-season",
  statusLabel: "In season · Match ready",
  sports: ["Cricket", "Football", "Athletics"],
  summary:
    "Versatile all-rounder with a strong record in district cricket and university football. Known for calm leadership under pressure and consistent tournament performances across formats.",
  stats: [
    { key: "matchesPlayed", label: "Matches Played", value: "142", helper: "Last 24 months" },
    { key: "totalWins", label: "Total Wins", value: "98", helper: "+12 this season" },
    { key: "winRate", label: "Win Rate", value: "69%", helper: "Across all sports" },
    { key: "tournaments", label: "Tournaments", value: "34", helper: "Registered events" },
    { key: "medals", label: "Medals", value: "18", helper: "Gold · Silver · Bronze" },
    { key: "championships", label: "Championships", value: "5", helper: "Titles won" },
  ],
  teams: [
    {
      id: "tm_1",
      name: "Mumbai Strikers FC",
      sport: "Football",
      role: "Midfielder",
      since: "2024",
    },
    {
      id: "tm_2",
      name: "Western Suburbs CC",
      sport: "Cricket",
      role: "All-rounder",
      since: "2022",
    },
    {
      id: "tm_3",
      name: "Sportxo Elite Athletics",
      sport: "Athletics",
      role: "Sprinter · 400m",
      since: "2023",
    },
  ],
  recentActivity: [
    {
      id: "act_1",
      type: "match",
      title: "Won vs Pune Warriors",
      detail: "District League · 2–1",
      timestamp: "2 days ago",
    },
    {
      id: "act_2",
      type: "training",
      title: "Completed sprint session",
      detail: "Performance lab · PB 400m",
      timestamp: "4 days ago",
    },
    {
      id: "act_3",
      type: "tournament",
      title: "Registered for Monsoon Cup",
      detail: "Cricket · T20 bracket",
      timestamp: "1 week ago",
    },
    {
      id: "act_4",
      type: "award",
      title: "Player of the Match",
      detail: "Western Suburbs CC vs Thane XI",
      timestamp: "2 weeks ago",
    },
  ],
  matches: [
    {
      id: "m_1",
      opponent: "Pune Warriors",
      tournament: "District League",
      date: "Jul 28, 2026",
      result: "win",
      score: "2–1",
      status: "completed",
      sport: "Football",
    },
    {
      id: "m_2",
      opponent: "Thane XI",
      tournament: "Club Championship",
      date: "Jul 21, 2026",
      result: "win",
      score: "Won by 24 runs",
      status: "completed",
      sport: "Cricket",
    },
    {
      id: "m_3",
      opponent: "Delhi Velocity",
      tournament: "National Qualifiers",
      date: "Aug 8, 2026",
      status: "upcoming",
      sport: "Football",
    },
    {
      id: "m_4",
      opponent: "Chennai Cyclones",
      tournament: "Monsoon Cup",
      date: "Aug 15, 2026",
      status: "upcoming",
      sport: "Cricket",
    },
  ],
  performance: [
    { label: "Match fitness", value: 88, max: 100 },
    { label: "Technical form", value: 82, max: 100 },
    { label: "Consistency", value: 76, max: 100 },
    { label: "Tournament readiness", value: 91, max: 100 },
  ],
  achievements: [
    {
      id: "ach_1",
      title: "District Football Champion",
      organization: "Maharashtra FA",
      year: "2025",
      category: "Team title",
    },
    {
      id: "ach_2",
      title: "Best All-rounder",
      organization: "Western Suburbs CC",
      year: "2024",
      category: "Individual award",
    },
    {
      id: "ach_3",
      title: "400m University Gold",
      organization: "Inter-University Meet",
      year: "2024",
      category: "Athletics",
    },
    {
      id: "ach_4",
      title: "Fair Play Award",
      organization: "Sportxo Regional League",
      year: "2023",
      category: "Sportsmanship",
    },
  ],
};

export function getPlayerProfileBySlug(slug: string): PlayerProfile | null {
  if (slug === MOCK_PLAYER_PROFILE.slug) return MOCK_PLAYER_PROFILE;
  return null;
}
