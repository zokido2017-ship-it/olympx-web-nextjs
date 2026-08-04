export type TeamMemberRole =
  | "Head Coach"
  | "Captain"
  | "Vice Captain"
  | "Player"
  | "Staff";

export type TeamMember = {
  id: string;
  initials: string;
  name: string;
  role: TeamMemberRole;
  phone: string;
  avatarClassName: string;
};

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    initials: "RM",
    name: "Rahul Mehta",
    role: "Head Coach",
    phone: "+91 98765 43210",
    avatarClassName: "bg-sportxo-blue text-white",
  },
  {
    id: "2",
    initials: "AS",
    name: "Arjun Sharma",
    role: "Captain",
    phone: "+91 98765 43211",
    avatarClassName: "bg-emerald-500 text-white",
  },
  {
    id: "3",
    initials: "PP",
    name: "Priya Patel",
    role: "Vice Captain",
    phone: "+91 98765 43212",
    avatarClassName: "bg-teal-500 text-white",
  },
  {
    id: "4",
    initials: "VK",
    name: "Vikram Kumar",
    role: "Player",
    phone: "+91 98765 43213",
    avatarClassName: "bg-indigo-500 text-white",
  },
];

export const TEAM_SPORT_OPTIONS = [
  "Cricket",
  "Football",
  "Basketball",
  "Volleyball",
  "Hockey",
  "Badminton",
];

export const TEAM_SUMMARY = {
  totalMembers: 10,
  players: 4,
  coaches: 2,
  staffOther: 2,
};
