import { redirect } from "next/navigation";
import { PLAYER_PROFILE_PATH } from "@/lib/auth-session";

export default function LegacyPlayerProfileSetupPage() {
  redirect(PLAYER_PROFILE_PATH);
}
