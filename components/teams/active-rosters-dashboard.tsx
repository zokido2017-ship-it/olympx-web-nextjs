"use client";

import Link from "next/link";
import * as React from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Star,
  Trophy,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ROSTER_TEAM_ROWS,
  ROSTER_TOTAL,
  sportBadgeIcon,
} from "@/lib/data/teams-roster.mock";
import { cn } from "@/lib/utils";

const cardShell =
  "rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)]";

function TournamentDots({
  registered,
  total,
}: {
  registered: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 w-2 rounded-full",
              i < registered ? "bg-blue-500" : "bg-slate-200",
            )}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-600">
        {registered}/{total} Registered
      </span>
    </div>
  );
}

export function ActiveRostersDashboard() {
  const [view, setView] = React.useState<"list" | "grid">("list");
  const [page, setPage] = React.useState(1);
  const pageSize = 3;
  const showing = ROSTER_TEAM_ROWS.length;
  const pageCount = Math.max(1, Math.ceil(ROSTER_TOTAL / pageSize));

  return (
    <div className="relative space-y-6 pb-16">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Active Rosters
          </h1>
          <p className="max-w-2xl text-base text-slate-600">
            Monitor squad strength, captains, and tournament readiness across
            every registered team.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                view === "grid"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              )}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                view === "list"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              )}
            >
              <List className="h-4 w-4" aria-hidden />
              List
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-slate-200 bg-white px-4 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Filter className="h-4 w-4" aria-hidden />
            Filter Sport
          </Button>
          <Button
            asChild
            className="h-10 rounded-xl bg-blue-600 px-4 font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-600/90"
          >
            <Link href="/teams/create">
              <Plus className="h-4 w-4" aria-hidden />
              New Team
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cn(cardShell, "p-6")}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Live engagement
          </p>
          <p className="mt-2 text-4xl font-bold text-blue-600">124</p>
          <p className="mt-1 text-sm font-semibold text-emerald-600">
            +12% this week
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Active roster updates and check-ins
          </p>
        </Card>
        <Card className={cn(cardShell, "p-6")}>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Star className="h-5 w-5" fill="currentColor" strokeWidth={0} />
          </div>
          <p className="text-lg font-bold text-slate-900">Pro</p>
          <p className="mt-1 text-sm text-slate-600">18 Elite Tier Teams</p>
        </Card>
        <Card className={cn(cardShell, "p-6")}>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Trophy className="h-5 w-5" strokeWidth={2} />
          </div>
          <p className="text-lg font-bold text-slate-900">Global</p>
          <p className="mt-1 text-sm text-slate-600">4 International Cups</p>
        </Card>
      </div>

      {view === "list" ? (
        <div className={cn(cardShell, "overflow-hidden")}>
          <Table>
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Team name
                </TableHead>
                <TableHead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Sport
                </TableHead>
                <TableHead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Players
                </TableHead>
                <TableHead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Captain
                </TableHead>
                <TableHead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Tournaments
                </TableHead>
                <TableHead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Created
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROSTER_TEAM_ROWS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white shadow-sm",
                          row.logoGradient,
                        )}
                      >
                        {row.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">{row.name}</p>
                        <p className="text-xs font-medium text-slate-500">
                          {row.division}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="gap-1.5 border-slate-200 bg-slate-50 font-semibold uppercase tracking-wide text-slate-700"
                    >
                      <span className="text-sm" aria-hidden>
                        {sportBadgeIcon(row.sport)}
                      </span>
                      {row.sport}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {row.playerCount}
                      </span>
                      <div className="flex -space-x-2">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200"
                          >
                            <Users className="h-3.5 w-3.5 text-slate-600 opacity-80" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        {row.captainImage ? (
                          <AvatarImage
                            src={row.captainImage}
                            alt=""
                            width={36}
                            height={36}
                          />
                        ) : null}
                        <AvatarFallback className="text-xs font-semibold">
                          {row.captainInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-slate-800">
                        {row.captainName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TournamentDots
                      registered={row.tournamentsRegistered}
                      total={row.tournamentsTotal}
                    />
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-600">
                    {row.createdLabel}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Showing {showing} of {ROSTER_TOTAL} teams
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, pageCount) }, (_, i) => i + 1).map(
                (n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={cn(
                      "h-9 min-w-9 rounded-lg px-3 text-sm font-semibold",
                      page === n
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    {n}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROSTER_TEAM_ROWS.map((row) => (
            <Card key={row.id} className={cn(cardShell, "p-6")}>
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-base font-bold text-white",
                    row.logoGradient,
                  )}
                >
                  {row.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900">{row.name}</p>
                  <p className="text-xs text-slate-500">{row.division}</p>
                  <Badge
                    variant="outline"
                    className="mt-2 gap-1 border-slate-200 bg-slate-50 text-[10px] font-bold uppercase"
                  >
                    <span aria-hidden>{sportBadgeIcon(row.sport)}</span>
                    {row.sport}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="font-semibold text-slate-700">
                  {row.playerCount} players
                </span>
                <span className="text-slate-500">{row.captainName}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <button
        type="button"
        className="fixed bottom-8 right-8 z-20 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-lg shadow-slate-200/80 transition-transform hover:scale-105 lg:absolute lg:bottom-6 lg:right-6"
        aria-label="Activity"
      >
        <Activity className="h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  );
}
