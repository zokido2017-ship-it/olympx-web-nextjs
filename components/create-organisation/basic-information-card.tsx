"use client";

import { MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hubInputFocusClass } from "@/lib/management-hub-theme";
import { cn } from "@/lib/utils";

import { CreateOrgSectionCard } from "./create-org-section-card";

const controlClass =
  "rounded-lg border bg-slate-50 text-sm text-slate-900 shadow-sm transition-[border-color,box-shadow] placeholder:text-slate-400";

type BasicInformationCardProps = {
  bio: string;
  onBioChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  headquarters: string;
  onHeadquartersChange: (v: string) => void;
  showErrors: boolean;
  categoryError: boolean;
};

export function BasicInformationCard({
  bio,
  onBioChange,
  category,
  onCategoryChange,
  headquarters,
  onHeadquartersChange,
  showErrors,
  categoryError,
}: BasicInformationCardProps) {
  const catInvalid = showErrors && categoryError;

  return (
    <CreateOrgSectionCard title="Basic Information">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="bio"
            className="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          >
            Bio / About
          </Label>
          <Textarea
            id="bio"
            placeholder="Describe your organisation's history, mission, and goals..."
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            className={cn(
              "min-h-[152px] resize-y px-3.5 py-3",
              controlClass,
              "border-slate-200",
              hubInputFocusClass,
            )}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="category"
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Category
            </Label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                aria-invalid={catInvalid}
                className={cn(
                  "h-11 w-full cursor-pointer appearance-none rounded-lg border bg-slate-50 px-3.5 pr-10 text-sm font-medium text-slate-900 shadow-sm outline-none transition-[border-color,box-shadow]",
                  catInvalid
                    ? "border-rose-400 ring-2 ring-rose-500/15"
                    : "border-slate-200 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20",
                  "bg-[length:14px_14px] bg-[right_0.75rem_center] bg-no-repeat",
                  "[background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2224%22%20height=%2224%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%23475569%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3E%3Cpath%20d=%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')]",
                )}
              >
                <option value="">Select category…</option>
                <option value="pro">Professional club</option>
                <option value="youth">Youth academy</option>
                <option value="multi">Multi-sport</option>
                <option value="league">League / Federation</option>
              </select>
            </div>
            {catInvalid ? (
              <p className="text-xs font-medium text-rose-600" role="alert">
                Select a category.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="hq"
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Headquarters location
            </Label>
            <div className="relative">
              <MapPin
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                strokeWidth={2}
              />
              <Input
                id="hq"
                autoComplete="street-address"
                placeholder="City, Country"
                value={headquarters}
                onChange={(e) => onHeadquartersChange(e.target.value)}
                className={cn(
                  controlClass,
                  "h-11 border-slate-200 pl-10 pr-3.5",
                  hubInputFocusClass,
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </CreateOrgSectionCard>
  );
}
