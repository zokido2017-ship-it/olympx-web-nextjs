import type { Metadata } from "next";
import { AddTeamMembersView } from "@/components/dashboard/create-team/add-team-members-view";

export const metadata: Metadata = {
  title: "Add Team Members",
};

type TeamMembersPageProps = {
  params: Promise<{ teamId: string }>;
};

export default async function TeamMembersPage({ params }: TeamMembersPageProps) {
  const { teamId } = await params;
  return <AddTeamMembersView teamId={teamId} />;
}
