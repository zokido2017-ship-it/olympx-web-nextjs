"use client";

import { Globe, Link as LinkIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { hubInputFocusClass } from "@/lib/management-hub-theme";
import { cn } from "@/lib/utils";

import { CreateOrgSectionCard } from "./create-org-section-card";
import { IconInstagram, IconX } from "./create-org-icons";

const inputClass =
  "h-11 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 shadow-sm transition-[border-color,box-shadow] placeholder:text-slate-400 pl-10 pr-3.5";

type SocialPresenceCardProps = {
  website: string;
  onWebsiteChange: (v: string) => void;
  twitter: string;
  onTwitterChange: (v: string) => void;
  instagram: string;
  onInstagramChange: (v: string) => void;
};

export function SocialPresenceCard({
  website,
  onWebsiteChange,
  twitter,
  onTwitterChange,
  instagram,
  onInstagramChange,
}: SocialPresenceCardProps) {
  return (
    <CreateOrgSectionCard
      title="Social Presence"
      titleSuffix={
        <LinkIcon className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} aria-hidden />
      }
    >
      <div className="space-y-3">
        <div className="relative">
          <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="Website URL"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
            className={cn(inputClass, hubInputFocusClass)}
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-slate-700">
            <IconX className="h-3.5 w-3.5" />
          </span>
          <Input
            placeholder="Twitter / X handle"
            autoCapitalize="none"
            value={twitter}
            onChange={(e) => onTwitterChange(e.target.value)}
            className={cn(inputClass, hubInputFocusClass)}
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center">
            <IconInstagram className="h-3.5 w-3.5" />
          </span>
          <Input
            placeholder="Instagram handle"
            autoCapitalize="none"
            value={instagram}
            onChange={(e) => onInstagramChange(e.target.value)}
            className={cn(inputClass, hubInputFocusClass)}
          />
        </div>
      </div>
    </CreateOrgSectionCard>
  );
}
