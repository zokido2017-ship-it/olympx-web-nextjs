"use client";

import { useRef, useState } from "react";
import {
  ChevronRight,
  CloudUpload,
  Pencil,
  Search,
  Trash2,
  Trophy,
  UserRound,
  Users,
  Volleyball,
} from "lucide-react";
import { toast } from "sonner";
import { CreateTeamSection } from "@/components/dashboard/create-team/create-team-section";
import {
  MOCK_TEAM_MEMBERS,
  TEAM_SPORT_OPTIONS,
  TEAM_SUMMARY,
  type TeamMemberRole,
} from "@/constants/create-team";
import { Button } from "@/components/ui/shadcn-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

const roleBadgeStyles: Record<TeamMemberRole, string> = {
  "Head Coach": "bg-orange-100 text-orange-700",
  Captain: "bg-sportxo-blue/10 text-sportxo-blue",
  "Vice Captain": "bg-violet-100 text-violet-700",
  Player: "bg-emerald-100 text-emerald-700",
  Staff: "bg-slate-100 text-slate-700",
};

export function CreateTeamView() {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [teamName, setTeamName] = useState("");
  const [teamSport, setTeamSport] = useState("");
  const [description, setDescription] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [linkedName, setLinkedName] = useState("Name linked to phone");

  const onSaveDraft = () => toast.success("Team draft saved");
  const onCreateTeam = () => toast.success("Team created");

  return (
    <div className="w-full bg-sportxo-surface px-4 pb-10 pt-6 md:px-6 md:pt-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sportxo-navy md:text-3xl">
            Create Team
          </h1>
          <p className="mt-1 text-sm text-sportxo-text-muted">
            Build your team by adding players and staff.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            className="min-w-[140px] font-semibold uppercase tracking-wide"
            onClick={onSaveDraft}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            className="min-w-[160px] font-bold uppercase tracking-wide"
            onClick={onCreateTeam}
          >
            Create Team!
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <CreateTeamSection title="Team Information">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="teamName">Team Name *</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Mumbai Warriors"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="teamSport">Team Sport *</Label>
              <select
                id="teamSport"
                value={teamSport}
                onChange={(e) => setTeamSport(e.target.value)}
                className="h-11 w-full rounded-lg border border-sportxo-border bg-sportxo-white px-3.5 text-sm text-sportxo-navy shadow-sportxo-soft outline-none focus:border-sportxo-blue focus:ring-2 focus:ring-sportxo-blue/20"
              >
                <option value="">Select Sport</option>
                {TEAM_SPORT_OPTIONS.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Tell us about your team — goals, history..."
                className="w-full resize-y rounded-lg border border-sportxo-border bg-sportxo-white px-3.5 py-3 text-sm text-sportxo-navy shadow-sportxo-soft outline-none placeholder:text-sportxo-text-muted focus:border-sportxo-blue focus:ring-2 focus:ring-sportxo-blue/20"
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label>Team Logo</Label>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sportxo-border bg-[#F8FAFC] px-6 py-10 transition-colors hover:border-sportxo-blue/40 hover:bg-[#EFF6FF]"
              >
                <CloudUpload className="size-8 text-sportxo-blue" aria-hidden />
                <span className="text-sm font-semibold text-sportxo-navy">
                  Upload Team Logo
                </span>
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
            </div>
          </div>
        </CreateTeamSection>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <CreateTeamSection title="Add Team Members">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="searchPhone" className="text-xs uppercase tracking-wide">
                    Search by phone number
                  </Label>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-sportxo-text-muted"
                      aria-hidden
                    />
                    <Input
                      id="searchPhone"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      placeholder="Enter phone number (10 digits)"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-sportxo-border/80 bg-[#F8FAFC] p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sportxo-border/60 text-sportxo-text-muted">
                      <UserRound className="size-6" aria-hidden />
                    </div>
                    <div className="grid flex-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-sportxo-text-muted">
                          Name linked to phone
                        </Label>
                        <Input value={linkedName} readOnly className="bg-sportxo-white" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="jersey">Jersey #</Label>
                        <Input
                          id="jersey"
                          value={jerseyNumber}
                          onChange={(e) => setJerseyNumber(e.target.value)}
                          placeholder="e.g. 07"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="shrink-0 font-semibold uppercase tracking-wide text-sportxo-blue"
                    >
                      Add Member
                    </Button>
                  </div>
                </div>
              </div>
            </CreateTeamSection>

            <CreateTeamSection
              title="Team Members"
              badge={
                <span className="rounded-full bg-sportxo-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-sportxo-blue">
                  {TEAM_SUMMARY.totalMembers} Members
                </span>
              }
            >
              <ul className="divide-y divide-sportxo-border/70">
                {MOCK_TEAM_MEMBERS.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        member.avatarClassName,
                      )}
                    >
                      {member.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sportxo-navy">
                          {member.name}
                        </p>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            roleBadgeStyles[member.role],
                          )}
                        >
                          {member.role}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-sportxo-text-muted">
                        {member.phone}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-sportxo-text-muted transition-colors hover:bg-sportxo-surface hover:text-sportxo-navy"
                        aria-label={`Edit ${member.name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-sportxo-text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${member.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sportxo-blue hover:text-[#1d4ed8]"
              >
                View all {TEAM_SUMMARY.totalMembers} members
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </CreateTeamSection>
          </div>

          <CreateTeamSection title="Team Summary" className="h-fit xl:sticky xl:top-24">
            <div className="grid grid-cols-2 gap-4">
              <SummaryTile
                label="Total Members"
                value={TEAM_SUMMARY.totalMembers}
                icon={Users}
                iconClassName="text-sportxo-blue bg-[#EFF6FF]"
              />
              <SummaryTile
                label="Players"
                value={TEAM_SUMMARY.players}
                icon={Volleyball}
                iconClassName="text-emerald-600 bg-emerald-50"
              />
              <SummaryTile
                label="Coaches"
                value={TEAM_SUMMARY.coaches}
                icon={UserRound}
                iconClassName="text-orange-600 bg-orange-50"
              />
              <SummaryTile
                label="Staff / Other"
                value={TEAM_SUMMARY.staffOther}
                icon={Trophy}
                iconClassName="text-violet-600 bg-violet-50"
              />
            </div>
          </CreateTeamSection>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
}) {
  return (
    <div className="rounded-xl border border-sportxo-border/70 bg-[#F8FAFC] p-4">
      <span
        className={cn(
          "mb-3 flex size-9 items-center justify-center rounded-lg",
          iconClassName,
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <p className="text-2xl font-bold text-sportxo-navy">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-sportxo-text-muted">{label}</p>
    </div>
  );
}
