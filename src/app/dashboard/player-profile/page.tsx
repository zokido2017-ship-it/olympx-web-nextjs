import { redirect } from "next/navigation";
import { PLAYER_PROFILE_PATH } from "@/lib/auth-session";

export default function DashboardPlayerProfileRedirectPage() {
  redirect(PLAYER_PROFILE_PATH);
}
