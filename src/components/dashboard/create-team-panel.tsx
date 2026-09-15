import { redirect } from "next/navigation";

/** @deprecated Use `/dashboard/my-teams` routes instead. */
export function CreateTeamPanel() {
  redirect("/dashboard/my-teams");
}
