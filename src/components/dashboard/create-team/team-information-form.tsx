"use client";

import { useRef } from "react";
import { CloudUpload } from "lucide-react";
import { CreateTeamSection } from "@/components/dashboard/create-team/create-team-section";
import { TEAM_SPORT_OPTIONS } from "@/constants/create-team";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type TeamInformationFormValues = {
  name: string;
  sport: string;
  description: string;
  logoPreviewUrl?: string | null;
};

type TeamInformationFormProps = {
  values: TeamInformationFormValues;
  onChange: (values: TeamInformationFormValues) => void;
};

export function TeamInformationForm({
  values,
  onChange,
}: TeamInformationFormProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<TeamInformationFormValues>) => {
    onChange({ ...values, ...patch });
  };

  const onLogoSelected = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      update({ logoPreviewUrl: typeof reader.result === "string" ? reader.result : null });
    };
    reader.readAsDataURL(file);
  };

  return (
    <CreateTeamSection title="Team Information">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="teamName">Team Name *</Label>
          <Input
            id="teamName"
            value={values.name}
            onChange={(event) => update({ name: event.target.value })}
            placeholder="e.g. Mumbai Warriors"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="teamSport">Team Sport *</Label>
          <select
            id="teamSport"
            value={values.sport}
            onChange={(event) => update({ sport: event.target.value })}
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
            value={values.description}
            onChange={(event) => update({ description: event.target.value })}
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
            className="flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-sportxo-border bg-[#F8FAFC] px-6 py-10 transition-colors hover:border-sportxo-blue/40 hover:bg-[#EFF6FF]"
          >
            {values.logoPreviewUrl ? (
              <img
                src={values.logoPreviewUrl}
                alt="Team logo preview"
                className="max-h-24 max-w-full rounded-lg object-contain"
              />
            ) : (
              <>
                <CloudUpload className="size-8 text-sportxo-blue" aria-hidden />
                <span className="text-sm font-semibold text-sportxo-navy">
                  Upload Team Logo
                </span>
              </>
            )}
          </button>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => onLogoSelected(event.target.files?.[0] ?? null)}
          />
        </div>
      </div>
    </CreateTeamSection>
  );
}
