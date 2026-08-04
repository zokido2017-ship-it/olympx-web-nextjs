import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPlayerProfileBySlug } from "@/data/mock-player-profile";
import { PlayerProfileShell } from "@/components/profile/player-profile-shell";
import { PlayerProfileView } from "@/components/profile/player-profile-view";

type PlayerProfilePageProps = {
  params: Promise<{ playerId: string }>;
};

export async function generateMetadata({
  params,
}: PlayerProfilePageProps): Promise<Metadata> {
  const { playerId } = await params;
  const profile = getPlayerProfileBySlug(playerId);

  return {
    title: profile ? profile.name : "Player Profile",
    description: profile?.summary,
  };
}

export default async function PlayerProfilePage({
  params,
}: PlayerProfilePageProps) {
  const { playerId } = await params;
  const profile = getPlayerProfileBySlug(playerId);

  if (!profile) notFound();

  return (
    <PlayerProfileShell>
      <PlayerProfileView profile={profile} />
    </PlayerProfileShell>
  );
}
