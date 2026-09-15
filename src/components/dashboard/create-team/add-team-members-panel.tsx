"use client";

import { useMemo, useState } from "react";
import {
  ChevronRight,
  Pencil,
  Search,
  Trash2,
  Trophy,
  UserRound,
  Users,
  Volleyball,
} from "lucide-react";
import { CreateTeamSection } from "@/components/dashboard/create-team/create-team-section";
import { TeamSummaryTile } from "@/components/dashboard/create-team/team-summary-tile";
import type { TeamMemberRole } from "@/constants/create-team";
import { Button } from "@/components/ui/shadcn-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";
import type { TeamMemberRecord } from "@/types/team";

const roleBadgeStyles: Record<TeamMemberRole, string> = {
  "Head Coach": "bg-orange-100 text-orange-700",
  Captain: "bg-sportxo-blue/10 text-sportxo-blue",
  "Vice Captain": "bg-violet-100 text-violet-700",
  Player: "bg-emerald-100 text-emerald-700",
  Staff: "bg-slate-100 text-slate-700",
};

const AVATAR_CLASSES = [
  "bg-sportxo-blue text-white",
  "bg-emerald-500 text-white",
  "bg-teal-500 text-white",
  "bg-indigo-500 text-white",
  "bg-violet-500 text-white",
];

type AddTeamMembersPanelProps = {
  members: TeamMemberRecord[];
  onMembersChange: (members: TeamMemberRecord[]) => void;
};

function countByRole(members: TeamMemberRecord[]) {
  const players = members.filter((member) => member.role === "Player").length;
  const coaches = members.filter((member) =>
    ["Head Coach", "Captain", "Vice Captain"].includes(member.role),
  ).length;
  const staffOther = members.filter((member) => member.role === "Staff").length;

  return {
    totalMembers: members.length,
    players,
    coaches,
    staffOther,
  };
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function AddTeamMembersPanel({
  members,
  onMembersChange,
}: AddTeamMembersPanelProps) {
  const [searchPhone, setSearchPhone] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [linkedName, setLinkedName] = useState("Name linked to phone");

  const summary = useMemo(() => countByRole(members), [members]);

  const onAddMember = () => {
    const phone = searchPhone.trim();
    if (!/^\d{10}$/.test(phone)) {
      return;
    }

    const name = linkedName.trim() || "New Member";
    const member: TeamMemberRecord = {
      id: `member_${Date.now()}`,
      initials: initialsFromName(name),
      name,
      role: "Player",
      phone: `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`,
      jerseyNumber: jerseyNumber.trim() || undefined,
      avatarClassName: AVATAR_CLASSES[members.length % AVATAR_CLASSES.length],
    };

    onMembersChange([...members, member]);
    setSearchPhone("");
    setJerseyNumber("");
    setLinkedName("Name linked to phone");
  };

  const onRemoveMember = (memberId: string) => {
    onMembersChange(members.filter((member) => member.id !== memberId));
  };

  return (
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
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
                    setSearchPhone(digits);
                    if (digits.length === 10) {
                      setLinkedName(`Player ${digits.slice(-4)}`);
                    }
                  }}
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
                    <Input
                      value={linkedName}
                      onChange={(event) => setLinkedName(event.target.value)}
                      className="bg-sportxo-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jersey">Jersey #</Label>
                    <Input
                      id="jersey"
                      value={jerseyNumber}
                      onChange={(event) => setJerseyNumber(event.target.value)}
                      placeholder="e.g. 07"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 font-semibold uppercase tracking-wide text-sportxo-blue"
                  onClick={onAddMember}
                  disabled={searchPhone.length !== 10}
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
              {summary.totalMembers} Members
            </span>
          }
        >
          {members.length === 0 ? (
            <p className="text-sm text-sportxo-text-muted">
              No members added yet. Search by phone number to add your first member.
            </p>
          ) : (
            <ul className="divide-y divide-sportxo-border/70">
              {members.map((member) => (
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
                      <p className="font-semibold text-sportxo-navy">{member.name}</p>
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
                      {member.jerseyNumber ? ` · #${member.jerseyNumber}` : ""}
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
                      onClick={() => onRemoveMember(member.id)}
                      className="rounded-lg p-2 text-sportxo-text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${member.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {members.length > 0 ? (
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sportxo-blue hover:text-[#1d4ed8]"
            >
              View all {summary.totalMembers} members
              <ChevronRight className="size-4" aria-hidden />
            </button>
          ) : null}
        </CreateTeamSection>
      </div>

      <CreateTeamSection title="Team Summary" className="h-fit xl:sticky xl:top-24">
        <div className="grid grid-cols-2 gap-4">
          <TeamSummaryTile
            label="Total Members"
            value={summary.totalMembers}
            icon={Users}
            iconClassName="text-sportxo-blue bg-[#EFF6FF]"
          />
          <TeamSummaryTile
            label="Players"
            value={summary.players}
            icon={Volleyball}
            iconClassName="text-emerald-600 bg-emerald-50"
          />
          <TeamSummaryTile
            label="Coaches"
            value={summary.coaches}
            icon={UserRound}
            iconClassName="text-orange-600 bg-orange-50"
          />
          <TeamSummaryTile
            label="Staff / Other"
            value={summary.staffOther}
            icon={Trophy}
            iconClassName="text-violet-600 bg-violet-50"
          />
        </div>
      </CreateTeamSection>
    </div>
  );
}
