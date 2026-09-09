import { redirect } from "next/navigation";
import { PLAYER_PROFILE_PATH } from "@/lib/auth-session";

/** Legacy route — registration is unified; teams and orgs are created after signup. */
export default function SignupRolePage() {
  redirect(PLAYER_PROFILE_PATH);
}
