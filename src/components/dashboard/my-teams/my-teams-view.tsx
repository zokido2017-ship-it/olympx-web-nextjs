"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/shadcn-button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getMyTeams } from "@/lib/teams-storage";
import {
  fetchTeams,
  getTeamSportLabel,
  resolveTeamLogoUrl,
} from "@/services/teams-api.service";
import type { ApiTeam } from "@/types/api";
import type { StoredTeam } from "@/types/team";

type TeamRow = {
  id: string;
  name: string;
  sport: string;
  membersCount: number;
  status: "draft" | "created";
  createdAt: string;
  logoUrl: string | null;
};

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

function mapApiTeam(team: ApiTeam): TeamRow {
  return {
    id: String(team.id),
    name: team.name,
    sport: getTeamSportLabel(team),
    membersCount: team.members_count ?? team.players_count ?? 0,
    status: "created",
    createdAt: team.created_at ?? new Date().toISOString(),
    logoUrl: resolveTeamLogoUrl(team),
  };
}

function mapStoredTeam(team: StoredTeam): TeamRow {
  return {
    id: team.id,
    name: team.name,
    sport: team.sport,
    membersCount: team.members.length,
    status: team.status,
    createdAt: team.createdAt,
    logoUrl: team.logoPreviewUrl ?? null,
  };
}

export function MyTeamsView() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTeams() {
      setLoadError(null);

      try {
        const apiTeams = await fetchTeams();
        const localDrafts = getMyTeams().filter((team) => team.status === "draft");
        const apiIds = new Set(apiTeams.map((team) => String(team.id)));

        const rows = [
          ...localDrafts
            .filter((team) => !team.apiId || !apiIds.has(String(team.apiId)))
            .map(mapStoredTeam),
          ...apiTeams.map(mapApiTeam),
        ].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        if (!cancelled) {
          setTeams(rows);
        }
      } catch (error) {
        if (!cancelled) {
          setTeams(getMyTeams().map(mapStoredTeam));
          setLoadError(
            getApiErrorMessage(error, "Could not load teams from the API."),
          );
        }
      } finally {
        if (!cancelled) {
          setMounted(true);
        }
      }
    }

    void loadTeams();

    return () => {
      cancelled = true;
    };
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
          {loadError ? (
            <p className="mt-2 text-sm text-amber-700">{loadError}</p>
          ) : null}
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
                        {team.logoUrl ? (
                          <img
                            src={team.logoUrl}
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
                      {team.membersCount}
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
                      {team.status === "created" ? (
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
                      ) : (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="font-semibold"
                        >
                          <Link href="/dashboard/my-teams/create">Continue Draft</Link>
                        </Button>
                      )}
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
