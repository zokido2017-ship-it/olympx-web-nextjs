import type { Metadata } from "next";
import { PlayerProfileRoute } from "@/components/player-setup/player-profile-route";

export const metadata: Metadata = {
  title: "Player Profile",
  description: "Complete your Sportxo player profile.",
};

export default function PlayerProfilePage() {
  return <PlayerProfileRoute />;
}
