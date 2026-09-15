"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AddTeamMembersPanel } from "@/components/dashboard/create-team/add-team-members-panel";
import { getTeamById, saveTeam } from "@/lib/teams-storage";
import type { StoredTeam, TeamMemberRecord } from "@/types/team";

type AddTeamMembersViewProps = {
  teamId: string;
};

export function AddTeamMembersView({ teamId }: AddTeamMembersViewProps) {
  const router = useRouter();
  const [team, setTeam] = useState<StoredTeam | null>(null);
  const [members, setMembers] = useState<TeamMemberRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loaded = getTeamById(teamId);
    if (!loaded) {
      router.replace("/dashboard/my-teams");
      return;
    }

    setTeam(loaded);
    setMembers(loaded.members);
    setMounted(true);
  }, [router, teamId]);

  if (!mounted || !team) {
    return (
      <div className="px-4 py-10 text-center text-sm text-sportxo-text-muted md:px-2">
        Loading team…
      </div>
    );
  }

  const onSaveMembers = () => {
    saveTeam({
      ...team,
      members,
      status: team.status === "draft" ? "created" : team.status,
    });
    toast.success("Team members saved");
    router.push("/dashboard/my-teams");
  };

  return (
    <div className="w-full px-4 pb-10 pt-2 md:px-2 md:pt-0">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sportxo-navy md:text-3xl">
            Add Team Members
          </h1>
          <p className="mt-1 text-sm text-sportxo-text-muted">
            {team.name} · {team.sport}
          </p>
        </div>
        <button
          type="button"
          onClick={onSaveMembers}
          className="inline-flex min-w-[160px] items-center justify-center rounded-lg bg-sportxo-blue px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_10px_24px_-12px_rgb(37_99_235_/_0.9)] hover:bg-[#1d4ed8]"
        >
          Save Members
        </button>
      </div>

      <AddTeamMembersPanel members={members} onMembersChange={setMembers} />

      <p className="mt-6 text-sm text-sportxo-text-muted">
        <Link href="/dashboard/my-teams" className="font-semibold text-sportxo-blue">
          Back to My Teams
        </Link>
      </p>
    </div>
  );
}
