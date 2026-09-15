"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getDefaultFoundedYear,
  parseFoundedYear,
  TeamInformationForm,
  type TeamInformationFormValues,
} from "@/components/dashboard/create-team/team-information-form";
import { Button } from "@/components/ui/shadcn-button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getStoredPlayerId } from "@/lib/auth-session";
import {
  clearTeamDraft,
  createTeamId,
  readTeamDraft,
  saveTeam,
  writeTeamDraft,
} from "@/lib/teams-storage";
import { createTeam } from "@/services/teams-api.service";
import { fetchSportsFromApi } from "@/services/sports-api.service";

const emptyValues: TeamInformationFormValues = {
  name: "",
  sportId: "",
  description: "",
  foundedYear: getDefaultFoundedYear(),
  logoPreviewUrl: null,
};

export function CreateTeamFormView() {
  const router = useRouter();
  const [values, setValues] = useState<TeamInformationFormValues>(emptyValues);
  const [draftTeamId, setDraftTeamId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const draft = readTeamDraft();
    if (draft) {
      setValues({
        name: draft.name,
        sportId: draft.sportId,
        description: draft.description,
        foundedYear: draft.foundedYear || getDefaultFoundedYear(),
        logoPreviewUrl: draft.logoPreviewUrl ?? null,
      });
    }
  }, []);

  const resolveSportName = async (sportId: string): Promise<string> => {
    try {
      const result = await fetchSportsFromApi();
      return result.sports.find((sport) => sport.id === sportId)?.name ?? sportId;
    } catch {
      return sportId;
    }
  };

  const onSaveDraft = async () => {
    if (!values.name.trim() || !values.sportId) {
      toast.error("Enter team name and sport before saving a draft.");
      return;
    }

    const foundedYear = parseFoundedYear(values.foundedYear);
    if (!foundedYear) {
      toast.error("Enter a valid founded year between 1850 and 2100.");
      return;
    }

    const sportName = await resolveSportName(values.sportId);

    writeTeamDraft({
      name: values.name.trim(),
      sportId: values.sportId,
      description: values.description.trim(),
      foundedYear: String(foundedYear),
      logoPreviewUrl: values.logoPreviewUrl,
    });

    const teamId = draftTeamId ?? createTeamId();
    setDraftTeamId(teamId);
    saveTeam({
      id: teamId,
      name: values.name.trim(),
      sport: sportName,
      sportId: Number.parseInt(values.sportId, 10),
      foundedYear,
      description: values.description.trim() || undefined,
      logoPreviewUrl: values.logoPreviewUrl,
      status: "draft",
      createdAt: new Date().toISOString(),
      members: [],
    });

    toast.success("Team draft saved");
    router.push("/dashboard/my-teams");
  };

  const onCreateTeam = async () => {
    if (!values.name.trim()) {
      toast.error("Enter a team name.");
      return;
    }

    const sportId = Number.parseInt(values.sportId, 10);
    if (!Number.isFinite(sportId)) {
      toast.error("Select a team sport.");
      return;
    }

    const foundedYear = parseFoundedYear(values.foundedYear);
    if (!foundedYear) {
      toast.error("Enter a valid founded year between 1850 and 2100.");
      return;
    }

    const playerId = getStoredPlayerId();
    if (!playerId) {
      toast.error("Complete your player profile before creating a team.");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdTeam = await createTeam({
        player_id: [playerId],
        sport_id: sportId,
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        founded_year: foundedYear,
        metadata: [],
      });

      clearTeamDraft();
      const sportName = createdTeam.sport?.name ?? await resolveSportName(values.sportId);

      saveTeam({
        id: String(createdTeam.id),
        apiId: createdTeam.id,
        name: createdTeam.name,
        sport: sportName,
        sportId: createdTeam.sport_id ?? sportId,
        foundedYear: createdTeam.founded_year ?? foundedYear,
        description:
          createdTeam.description ??
          (values.description.trim() || undefined),
        logoPreviewUrl: values.logoPreviewUrl,
        status: "created",
        createdAt: createdTeam.created_at ?? new Date().toISOString(),
        members: [],
      });

      toast.success("Team created");
      router.push("/dashboard/my-teams");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create team. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={() => void onSaveDraft()}
            disabled={isSubmitting}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            className="min-w-[160px] font-bold uppercase tracking-wide"
            onClick={() => void onCreateTeam()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating…" : "Create Team"}
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
