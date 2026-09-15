import type { Metadata } from "next";
import { MyTeamsView } from "@/components/dashboard/my-teams/my-teams-view";

export const metadata: Metadata = {
  title: "My Teams",
};

export default function MyTeamsPage() {
  return <MyTeamsView />;
}
