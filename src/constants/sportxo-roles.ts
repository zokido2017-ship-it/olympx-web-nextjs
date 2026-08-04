import type { IconType } from "react-icons";
import {
  HiBuildingOffice2,
  HiUser,
  HiUserGroup,
} from "react-icons/hi2";

export type SportxoRoleId = "player" | "team" | "organisation";

export type SportxoRoleOption = {
  id: SportxoRoleId;
  title: string;
  description: string;
  icon: IconType;
};

export const SPORTXO_ROLES: SportxoRoleOption[] = [
  {
    id: "player",
    title: "Player / Athlete",
    description: "Track performance, join teams, and compete in events.",
    icon: HiUser,
  },
  {
    id: "team",
    title: "Team",
    description: "Manage rosters, schedules, and team communications.",
    icon: HiUserGroup,
  },
  {
    id: "organisation",
    title: "Organisation",
    description: "Run leagues, venues, and multi-team operations.",
    icon: HiBuildingOffice2,
  },
];
