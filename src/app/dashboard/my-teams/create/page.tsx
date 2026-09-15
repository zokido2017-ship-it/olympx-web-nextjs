import type { Metadata } from "next";
import { CreateTeamFormView } from "@/components/dashboard/create-team/create-team-form-view";

export const metadata: Metadata = {
  title: "Create Team",
};

export default function CreateTeamPage() {
  return <CreateTeamFormView />;
}
