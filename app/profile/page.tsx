import { AthleteDashboardShell } from "@/components/athlete-dashboard";
import { RequireOlympxAuth } from "@/components/auth/require-olympx-auth";

export default function ProfilePage() {
  return (
    <RequireOlympxAuth>
      <AthleteDashboardShell />
    </RequireOlympxAuth>
  );
}
