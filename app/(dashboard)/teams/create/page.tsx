import { Suspense } from "react";

import { CreateTeamView } from "@/components/teams/create-team-view";

export default function CreateTeamPage() {
  return (
    <Suspense fallback={null}>
      <CreateTeamView />
    </Suspense>
  );
}
