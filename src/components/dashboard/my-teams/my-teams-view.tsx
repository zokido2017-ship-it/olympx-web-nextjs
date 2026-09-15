"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/shadcn-button";
import { getMyTeams } from "@/lib/teams-storage";
import type { StoredTeam } from "@/types/team";

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function MyTeamsView() {
  const [teams, setTeams] = useState<StoredTeam[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTeams(getMyTeams());
  }, []);

  if (!mounted) {
    return (
      <div className="px-4 py-10 text-center text-sm text-sportxo-text-muted md:px-2">
        Loading teams…
      </div>
    );
  }

  return (
    <div className="w-full px-4 pb-10 pt-2 md:px-2 md:pt-0">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sportxo-navy md:text-3xl">
            My Teams
          </h1>
          <p className="mt-1 text-sm text-sportxo-text-muted">
            View and manage the teams you have created.
          </p>
        </div>
        <Button
          asChild
          className="shrink-0 font-bold uppercase tracking-wide"
        >
          <Link href="/dashboard/my-teams/create">
            <Plus className="size-4" aria-hidden />
            Create Team
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-sportxo-border/80 bg-sportxo-white shadow-sportxo-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-sportxo-border/80 bg-[#F8FAFC] text-xs uppercase tracking-wide text-sportxo-text-muted">
              <tr>
                <th className="px-5 py-4 font-semibold">Team Name</th>
                <th className="px-5 py-4 font-semibold">Sport</th>
                <th className="px-5 py-4 font-semibold">Members</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Created</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sportxo-border/70">
              {teams.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sportxo-text-muted"
                  >
                    You have not created any teams yet. Click{" "}
                    <span className="font-semibold text-sportxo-navy">Create Team</span>{" "}
                    to get started.
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team.id} className="hover:bg-[#F8FAFC]/80">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {team.logoPreviewUrl ? (
                          <img
                            src={team.logoPreviewUrl}
                            alt=""
                            className="size-10 rounded-lg border border-sportxo-border object-cover"
                          />
                        ) : (
                          <span className="flex size-10 items-center justify-center rounded-lg bg-sportxo-blue/10 text-xs font-bold text-sportxo-blue">
                            {team.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        <span className="font-semibold text-sportxo-navy">
                          {team.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sportxo-text-muted">{team.sport}</td>
                    <td className="px-5 py-4 text-sportxo-text-muted">
                      {team.members.length}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          team.status === "created"
                            ? "rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-700"
                            : "rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700"
                        }
                      >
                        {team.status === "created" ? "Created" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sportxo-text-muted">
                      {formatDate(team.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="font-semibold"
                      >
                        <Link href={`/dashboard/my-teams/${team.id}/members`}>
                          <UserPlus className="size-4" aria-hidden />
                          Add Team Members
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
