"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
  Briefcase,
  CloudUpload,
  ImagePlus,
  Pencil,
  Rocket,
  Search,
  ShieldCheck,
  Trash2,
  Trophy,
  UserPlus,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const accent = "text-[#1D61D1]";

type MockPlayer = {
  id: string;
  name: string;
  position: string;
  playerId: string;
  role: "CAPTAIN" | "PLAYER" | "SUBSTITUTE";
  initials: string;
  image?: string;
};

const MOCK_PLAYERS: MockPlayer[] = [
  {
    id: "1",
    name: "Marcus Chen",
    position: "Striker",
    playerId: "PLR-8821",
    role: "CAPTAIN",
    initials: "MC",
    image:
      "https://images.unsplash.com/photo-1531384441138-273dee84f30a?w=80&h=80&fit=crop",
  },
  {
    id: "2",
    name: "Elena Vasquez",
    position: "Midfield",
    playerId: "PLR-9012",
    role: "PLAYER",
    initials: "EV",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
  },
  {
    id: "3",
    name: "James Okonkwo",
    position: "Defense",
    playerId: "PLR-7744",
    role: "SUBSTITUTE",
    initials: "JO",
  },
];

function roleBadgeClass(role: MockPlayer["role"]) {
  if (role === "CAPTAIN") return "border-amber-200 bg-amber-50 text-amber-800";
  if (role === "PLAYER") return "border-sky-200 bg-sky-50 text-sky-800";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

const cardClass =
  "rounded-xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)]";

const sectionLabel = cn(
  "flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]",
  accent,
);

export function CreateTeamView() {
  const router = useRouter();
  const [players, setPlayers] = React.useState(MOCK_PLAYERS);

  const removePlayer = (id: string) => {
    setPlayers((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div className="relative mx-auto max-w-[1200px] space-y-8">
      <header className="space-y-3">
        <p
          className={cn(
            "text-xs font-bold uppercase tracking-[0.2em]",
            accent,
          )}
        >
          Roster management
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Create New Team
        </h1>
        <p className="max-w-2xl text-base text-slate-600">
          Assemble your elite squad and define their tactical identity
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Card className={cn(cardClass, "overflow-hidden")}>
            <CardHeader className="space-y-6 border-b border-slate-100 p-6 pb-6">
              <div className={sectionLabel}>
                <Briefcase className="h-4 w-4" strokeWidth={2} aria-hidden />
                Team identity
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="team-name"
                  className="text-sm font-semibold text-slate-800"
                >
                  Team Name
                </Label>
                <Input
                  id="team-name"
                  placeholder="e.g. Northern Wolves FC"
                  className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#1D61D1] focus-visible:ring-[#1D61D1]/20"
                />
                <p className="text-xs text-slate-500">
                  Visible on all public leaderboards and match schedules.
                </p>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="sport"
                  className="text-sm font-semibold text-slate-800"
                >
                  Sport Discipline
                </Label>
                <div className="relative">
                  <select
                    id="sport"
                    defaultValue=""
                    className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-10 text-sm text-slate-900 shadow-sm focus-visible:border-[#1D61D1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D61D1]/20 [&>option]:text-slate-900"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.65rem center",
                      backgroundSize: "14px 14px",
                    }}
                  >
                    <option value="" disabled>
                      Select a sport…
                    </option>
                    <option value="soccer">Soccer</option>
                    <option value="basketball">Basketball</option>
                    <option value="hockey">Hockey</option>
                    <option value="multi">Multi-sport</option>
                  </select>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className={cardClass}>
            <CardHeader className="space-y-4 p-6">
              <div className={sectionLabel}>
                <UserPlus className="h-4 w-4" strokeWidth={2} aria-hidden />
                Roster construction
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="player-search"
                  className="text-sm font-semibold text-slate-800"
                >
                  Add Players
                </Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="player-search"
                    placeholder="Search by name, position or ID..."
                    className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:border-[#1D61D1] focus-visible:ring-[#1D61D1]/20"
                  />
                </div>
              </div>
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/50">
                {players.map((pl) => (
                  <li
                    key={pl.id}
                    className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white"
                  >
                    <Avatar className="h-11 w-11 border border-slate-200">
                      {pl.image ? (
                        <AvatarImage src={pl.image} alt="" width={44} height={44} />
                      ) : null}
                      <AvatarFallback className="bg-slate-200 text-sm font-semibold text-slate-700">
                        {pl.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">
                        {pl.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {pl.position} · {pl.playerId}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "shrink-0 border font-bold tracking-wide",
                        roleBadgeClass(pl.role),
                      )}
                      variant="outline"
                    >
                      {pl.role}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => removePlayer(pl.id)}
                      className="shrink-0 rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50"
                      aria-label={`Remove ${pl.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <Card className={cardClass}>
            <CardHeader className="space-y-4 p-6">
              <div className={sectionLabel}>
                <CloudUpload className="h-4 w-4" strokeWidth={2} aria-hidden />
                Visual identity
              </div>
              <button
                type="button"
                className="flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 transition-colors hover:border-[#1D61D1]/40 hover:bg-slate-50"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1D61D1]/10 text-[#1D61D1]">
                  <ImagePlus className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  Upload Team Logo
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Drag and drop or click to browse
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  SVG, PNG or JPG (min. 400×400px)
                </p>
              </button>
            </CardHeader>
          </Card>

          <Card className={cn(cardClass, "relative overflow-visible")}>
            <CardHeader className="space-y-4 p-6">
              <div className={sectionLabel}>
                <ShieldCheck className="h-4 w-4" strokeWidth={2} aria-hidden />
                Governance
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-amber-500" strokeWidth={1.75} />
                  <span className="text-sm font-semibold text-slate-800">
                    Assign Captain
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 border border-slate-200">
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1531384441138-273dee84f30a?w=80&h=80&fit=crop"
                      alt=""
                    />
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D61D1] text-white shadow-md shadow-[#1D61D1]/25 transition-opacity hover:opacity-90"
                    aria-label="Edit captain"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>

            <div className="pointer-events-none absolute -top-2 right-4 z-10 w-[min(100%,280px)] rounded-xl border border-amber-200/80 bg-white p-3 shadow-lg shadow-slate-200/80">
              <div className="flex gap-3">
                <span className="text-lg" aria-hidden>
                  ✨
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Auto-Save Enabled</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Draft last updated 2m ago
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="button"
              className="h-12 w-full rounded-xl bg-[#1D61D1] text-base font-semibold text-white shadow-lg shadow-[#1D61D1]/25 hover:bg-[#1a56bd]"
            >
              <Rocket className="h-4 w-4" aria-hidden />
              Create Team
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-xl border-slate-200 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => router.push("/teams")}
            >
              Discard Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
