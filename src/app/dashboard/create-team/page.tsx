import type { Metadata } from "next";
import { CreateTeamPanel } from "@/components/dashboard/create-team-panel";

export const metadata: Metadata = {
  title: "Create Team",
};

export default function CreateTeamPage() {
  return <CreateTeamPanel />;
}
