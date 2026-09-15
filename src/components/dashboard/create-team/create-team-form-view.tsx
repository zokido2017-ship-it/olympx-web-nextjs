"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  TeamInformationForm,
  type TeamInformationFormValues,
} from "@/components/dashboard/create-team/team-information-form";
import { Button } from "@/components/ui/shadcn-button";
import {
  clearTeamDraft,
  createTeamId,
  readTeamDraft,
  saveTeam,
  writeTeamDraft,
} from "@/lib/teams-storage";

const emptyValues: TeamInformationFormValues = {
  name: "",
  sport: "",
  description: "",
  logoPreviewUrl: null,
};

export function CreateTeamFormView() {
  const router = useRouter();
  const [values, setValues] = useState<TeamInformationFormValues>(emptyValues);
  const [draftTeamId, setDraftTeamId] = useState<string | null>(null);

  useEffect(() => {
    const draft = readTeamDraft();
    if (draft) {
      setValues({
        name: draft.name,
        sport: draft.sport,
        description: draft.description,
        logoPreviewUrl: draft.logoPreviewUrl ?? null,
      });
    }
  }, []);

  const onSaveDraft = () => {
    if (!values.name.trim() || !values.sport) {
      toast.error("Enter team name and sport before saving a draft.");
      return;
    }

    writeTeamDraft({
      name: values.name.trim(),
      sport: values.sport,
      description: values.description.trim(),
      logoPreviewUrl: values.logoPreviewUrl,
    });

    const teamId = draftTeamId ?? createTeamId();
    setDraftTeamId(teamId);
    saveTeam({
      id: teamId,
      name: values.name.trim(),
      sport: values.sport,
      description: values.description.trim() || undefined,
      logoPreviewUrl: values.logoPreviewUrl,
      status: "draft",
      createdAt: new Date().toISOString(),
      members: [],
    });

    toast.success("Team draft saved");
    router.push("/dashboard/my-teams");
  };

  const onCreateTeam = () => {
    if (!values.name.trim()) {
      toast.error("Enter a team name.");
      return;
    }
    if (!values.sport) {
      toast.error("Select a team sport.");
      return;
    }

    clearTeamDraft();
    const teamId = draftTeamId ?? createTeamId();
    saveTeam({
      id: teamId,
      name: values.name.trim(),
      sport: values.sport,
      description: values.description.trim() || undefined,
      logoPreviewUrl: values.logoPreviewUrl,
      status: "created",
      createdAt: new Date().toISOString(),
      members: [],
    });

    toast.success("Team created");
    router.push("/dashboard/my-teams");
  };

  return (
    <div className="w-full px-4 pb-10 pt-2 md:px-2 md:pt-0">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sportxo-navy md:text-3xl">
            Create Team
          </h1>
          <p className="mt-1 text-sm text-sportxo-text-muted">
            Set up your team name, sport, and logo.
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
            Create Team
          </Button>
        </div>
      </div>

      <TeamInformationForm values={values} onChange={setValues} />

      <p className="mt-6 text-sm text-sportxo-text-muted">
        <Link href="/dashboard/my-teams" className="font-semibold text-sportxo-blue">
          Back to My Teams
        </Link>
      </p>
    </div>
  );
}
