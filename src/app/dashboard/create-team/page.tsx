import { redirect } from "next/navigation";

export default function LegacyCreateTeamPage() {
  redirect("/dashboard/my-teams");
}
