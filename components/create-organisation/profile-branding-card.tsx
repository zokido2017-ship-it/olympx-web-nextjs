"use client";

import { Camera, ImageIcon } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hubInputFocusClass } from "@/lib/management-hub-theme";
import { cn } from "@/lib/utils";

import { CreateOrgSectionCard } from "./create-org-section-card";

const inputClass =
  "h-11 rounded-lg border bg-slate-50 text-sm text-slate-900 shadow-sm transition-[border-color,box-shadow] placeholder:text-slate-400 disabled:opacity-60";

type FieldErrors = Partial<Record<"orgName" | "handle", boolean>>;

type ProfileBrandingCardProps = {
  orgName: string;
  onOrgNameChange: (v: string) => void;
  handle: string;
  onHandleChange: (v: string) => void;
  bannerPreview: string | null;
  logoPreview: string | null;
  onBannerSelected: (file: File | null) => void;
  onLogoSelected: (file: File | null) => void;
  showErrors: boolean;
  errors: FieldErrors;
};

export function ProfileBrandingCard({
  orgName,
  onOrgNameChange,
  handle,
  onHandleChange,
  bannerPreview,
  logoPreview,
  onBannerSelected,
  onLogoSelected,
  showErrors,
  errors,
}: ProfileBrandingCardProps) {
  const bannerInputRef = React.useRef<HTMLInputElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const orgInvalid = showErrors && Boolean(errors.orgName);
  const handleInvalid = showErrors && Boolean(errors.handle);

  return (
    <CreateOrgSectionCard title="Profile Branding">
      <div className="space-y-6">
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onBannerSelected(f);
            e.target.value = "";
          }}
        />
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onLogoSelected(f);
            e.target.value = "";
          }}
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            className={cn(
              "group relative flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200/90 bg-slate-100/90 transition-colors hover:border-slate-300 hover:bg-slate-100 md:min-h-[220px]",
            )}
          >
            {bannerPreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bannerPreview}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/25 opacity-0 transition-opacity group-hover:opacity-100" />
              </>
            ) : (
              <>
                <ImageIcon
                  className="mb-3 h-11 w-11 text-slate-400 transition-colors group-hover:text-slate-500"
                  strokeWidth={1.15}
                />
                <p className="max-w-md px-6 text-center text-sm font-semibold text-slate-600">
                  Click to upload banner image
                </p>
                <p className="mt-1 text-center text-xs font-medium text-slate-400">
                  Recommended: 1920×480px
                </p>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className={cn(
              "absolute -bottom-4 left-6 z-[1] flex h-[72px] w-[72px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-[3px] border-white bg-white shadow-[0_10px_28px_-8px_rgba(15,23,42,0.35)] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 sm:left-8 sm:h-[76px] sm:w-[76px]",
            )}
            aria-label="Upload organization logo"
          >
            {logoPreview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logoPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-7 w-7 text-slate-500" strokeWidth={1.5} />
            )}
          </button>
        </div>

        <div className="grid gap-5 pt-2 sm:grid-cols-2 sm:pt-4">
          <div className="space-y-2">
            <Label
              htmlFor="org-name"
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Organization name
            </Label>
            <Input
              id="org-name"
              autoComplete="organization"
              placeholder="e.g. London Knights"
              value={orgName}
              onChange={(e) => onOrgNameChange(e.target.value)}
              aria-invalid={orgInvalid}
              className={cn(
                inputClass,
                "px-3.5",
                orgInvalid
                  ? "border-rose-400 ring-2 ring-rose-500/15"
                  : "border-slate-200",
                hubInputFocusClass,
              )}
            />
            {orgInvalid ? (
              <p className="text-xs font-medium text-rose-600" role="alert">
                Enter an organization name.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="handle"
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              Unique handle
            </Label>
            <div
              className={cn(
                "flex overflow-hidden rounded-lg border bg-slate-50 shadow-sm transition-[box-shadow]",
                handleInvalid
                  ? "border-rose-400 ring-2 ring-rose-500/15"
                  : "border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20",
              )}
            >
              <span className="flex items-center border-r border-slate-200 bg-slate-100/90 px-3.5 text-sm font-bold text-slate-500">
                @
              </span>
              <Input
                id="handle"
                placeholder="londonknights"
                value={handle}
                onChange={(e) => onHandleChange(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={handleInvalid}
                className="h-11 flex-1 rounded-none border-0 bg-transparent px-3.5 shadow-none focus-visible:ring-0"
              />
            </div>
            {handleInvalid ? (
              <p className="text-xs font-medium text-rose-600" role="alert">
                Choose a unique handle.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </CreateOrgSectionCard>
  );
}
