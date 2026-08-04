import type { IconType } from "react-icons";
import { GiColiseum, GiGamepad, GiMountains } from "react-icons/gi";

export type SportCategory = "indoor" | "outdoor" | "digital";

export type SportOption = {
  id: string;
  name: string;
  category: SportCategory;
  iconSrc: string;
};

export const SPORT_CATEGORY_META: Record<
  SportCategory,
  { title: string; subtitle: string; icon: IconType; iconClassName: string }
> = {
  indoor: {
    title: "Indoor Sports",
    subtitle: "Select the indoor sports you play",
    icon: GiColiseum,
    iconClassName: "text-sportxo-blue",
  },
  outdoor: {
    title: "Outdoor Sports",
    subtitle: "Select the outdoor sports you play",
    icon: GiMountains,
    iconClassName: "text-sportxo-blue",
  },
  digital: {
    title: "Digital Sports",
    subtitle: "Select the digital sports you play",
    icon: GiGamepad,
    iconClassName: "text-violet-600",
  },
};

const icon = (id: string) => `/sports/icons/${id}.png`;

export const SPORTS_CATALOG: SportOption[] = [
  { id: "badminton", name: "Badminton", category: "indoor", iconSrc: icon("badminton") },
  {
    id: "table-tennis",
    name: "Table Tennis",
    category: "indoor",
    iconSrc: icon("table-tennis"),
  },
  { id: "squash", name: "Squash", category: "indoor", iconSrc: icon("squash") },
  { id: "chess", name: "Chess", category: "indoor", iconSrc: icon("chess") },
  { id: "carrom", name: "Carrom", category: "indoor", iconSrc: icon("carrom") },
  {
    id: "billiards",
    name: "Billiards",
    category: "indoor",
    iconSrc: icon("billiards"),
  },
  { id: "snooker", name: "Snooker", category: "indoor", iconSrc: icon("snooker") },
  {
    id: "pickleball",
    name: "Pickleball",
    category: "indoor",
    iconSrc: icon("pickleball"),
  },
  { id: "futsal", name: "Futsal", category: "indoor", iconSrc: icon("futsal") },
  {
    id: "volleyball-indoor",
    name: "Volleyball",
    category: "indoor",
    iconSrc: icon("volleyball-indoor"),
  },
  {
    id: "basketball-indoor",
    name: "Basketball",
    category: "indoor",
    iconSrc: icon("basketball-indoor"),
  },
  {
    id: "handball",
    name: "Handball",
    category: "indoor",
    iconSrc: icon("handball"),
  },
  {
    id: "yoga-competition",
    name: "Yoga Competition",
    category: "indoor",
    iconSrc: icon("yoga-competition"),
  },
  { id: "cricket", name: "Cricket", category: "outdoor", iconSrc: icon("cricket") },
  { id: "football", name: "Football", category: "outdoor", iconSrc: icon("football") },
  { id: "hockey", name: "Hockey", category: "outdoor", iconSrc: icon("hockey") },
  {
    id: "basketball-outdoor",
    name: "Basketball",
    category: "outdoor",
    iconSrc: icon("basketball-outdoor"),
  },
  {
    id: "baseball",
    name: "Baseball",
    category: "outdoor",
    iconSrc: icon("baseball"),
  },
  {
    id: "ultimate-frisbee",
    name: "Ultimate Frisbee",
    category: "outdoor",
    iconSrc: icon("ultimate-frisbee"),
  },
  {
    id: "tug-of-war",
    name: "Tug of War",
    category: "outdoor",
    iconSrc: icon("tug-of-war"),
  },
  {
    id: "marathon",
    name: "Marathon",
    category: "outdoor",
    iconSrc: icon("marathon"),
  },
  { id: "golf", name: "Golf", category: "outdoor", iconSrc: icon("golf") },
  { id: "tennis", name: "Tennis", category: "outdoor", iconSrc: icon("tennis") },
  {
    id: "fifa-ea-fc",
    name: "FIFA / EA FC",
    category: "digital",
    iconSrc: icon("fifa-ea-fc"),
  },
  {
    id: "clash-royale",
    name: "Clash Royale",
    category: "digital",
    iconSrc: icon("clash-royale"),
  },
];

export const SPORT_CATEGORY_ORDER: SportCategory[] = [
  "indoor",
  "outdoor",
  "digital",
];

export const INDOOR_SPORT_IDS = [
  "badminton",
  "table-tennis",
  "squash",
  "chess",
  "carrom",
  "billiards",
  "snooker",
  "pickleball",
  "futsal",
  "volleyball-indoor",
  "basketball-indoor",
  "handball",
  "yoga-competition",
] as const;

export const DIGITAL_SPORT_IDS = ["fifa-ea-fc", "clash-royale"] as const;

export const SPORT_CATEGORY_CHIP: Record<
  SportCategory,
  { unselectedChipBg: string; gridClassName: string }
> = {
  indoor: {
    unselectedChipBg: "#F8F9FC",
    gridClassName: "grid grid-cols-2 gap-3",
  },
  outdoor: {
    unselectedChipBg: "#FFFFFF",
    gridClassName: "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4",
  },
  digital: {
    unselectedChipBg: "#FFFFFF",
    gridClassName: "grid grid-cols-2 gap-3 md:grid-cols-3",
  },
};
