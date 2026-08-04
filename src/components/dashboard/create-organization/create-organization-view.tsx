"use client";

import { useRef, useState } from "react";
import { ArrowRight, Globe, ImageIcon, MapPin } from "lucide-react";
import { toast } from "sonner";
import { SportxoLogo } from "@/components/auth/sportxo-logo";
import { CreateOrganizationSection } from "@/components/dashboard/create-organization/create-organization-section";
import {
  CREATE_ORG_DEFAULTS,
  ORGANISATION_TYPE_OPTIONS,
} from "@/constants/create-organization";
import { Button } from "@/components/ui/shadcn-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

const fieldInputClass =
  "border-sportxo-border/80 bg-[#F4F6FB] shadow-none focus:bg-sportxo-white";

export function CreateOrganizationView() {
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [organisationName, setOrganisationName] = useState<string>(
    CREATE_ORG_DEFAULTS.organisationName,
  );
  const [headquarters, setHeadquarters] = useState<string>(
    CREATE_ORG_DEFAULTS.headquarters,
  );
  const [organisationType, setOrganisationType] = useState("");
  const [establishmentYear, setEstablishmentYear] = useState<string>(
    CREATE_ORG_DEFAULTS.establishmentYear,
  );
  const [shortDescription, setShortDescription] = useState<string>(
    CREATE_ORG_DEFAULTS.shortDescription,
  );
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState<string>(CREATE_ORG_DEFAULTS.website);

  const onSubmit = () => toast.success("Registration submitted");

  return (
    <div className="w-full bg-sportxo-surface pb-10">
      <header className="bg-sportxo-blue px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-wrap items-center gap-3">
          <SportxoLogo variant="light" />
          <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/95">
            Official Registration Portal
          </span>
        </div>
        <h1 className="mt-6 max-w-3xl text-2xl font-bold leading-tight text-white md:text-3xl">
          Register Your Sports Organization
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
          Create your official organization profile on the world&apos;s most
          trusted sports management platform.
        </p>
      </header>

      <div className="px-4 md:px-6">
        <div className="-mt-6 rounded-2xl border border-sportxo-border/80 bg-sportxo-white p-6 shadow-sportxo-card md:-mt-8 md:p-8">
          <CreateOrganizationSection title="Profile Branding">
            <div className="relative pb-6">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="flex aspect-[3/1] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sportxo-border bg-[#F4F6FB] px-4 text-center transition-colors hover:border-sportxo-blue/40 hover:bg-[#EFF6FF] md:min-h-[180px]"
              >
                <ImageIcon
                  className="size-8 text-sportxo-text-muted"
                  aria-hidden
                />
                <span className="text-sm font-medium text-sportxo-navy">
                  Click to upload banner image
                </span>
                <span className="text-xs text-sportxo-text-muted">
                  Recommended: 1920×640px
                </span>
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="absolute -bottom-2 left-4 flex size-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-sportxo-border bg-sportxo-white p-2 shadow-sportxo-soft transition-colors hover:border-sportxo-blue/40 md:left-6 md:size-28"
              >
                <ImageIcon
                  className="size-6 text-sportxo-blue"
                  aria-hidden
                />
                <span className="text-[10px] font-medium leading-tight text-sportxo-text-muted">
                  Profile photo
                </span>
              </button>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <FormField label="Organisation Name *" htmlFor="orgName">
                <Input
                  id="orgName"
                  value={organisationName}
                  onChange={(e) => setOrganisationName(e.target.value)}
                  className={fieldInputClass}
                />
              </FormField>

              <FormField label="Headquarters Location *" htmlFor="hq">
                <div className="relative">
                  <Input
                    id="hq"
                    value={headquarters}
                    onChange={(e) => setHeadquarters(e.target.value)}
                    className={cn(fieldInputClass, "pr-10")}
                  />
                  <MapPin
                    className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-sportxo-text-muted"
                    aria-hidden
                  />
                </div>
              </FormField>

              <FormField label="Organisation Type" htmlFor="orgType">
                <select
                  id="orgType"
                  value={organisationType}
                  onChange={(e) => setOrganisationType(e.target.value)}
                  className={cn(
                    "h-11 w-full rounded-lg border px-3.5 text-sm text-sportxo-navy outline-none focus:border-sportxo-blue focus:ring-2 focus:ring-sportxo-blue/20",
                    fieldInputClass,
                  )}
                >
                  <option value="">Select Type</option>
                  {ORGANISATION_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Establishment Year" htmlFor="estYear">
                <Input
                  id="estYear"
                  inputMode="numeric"
                  value={establishmentYear}
                  onChange={(e) => setEstablishmentYear(e.target.value)}
                  className={fieldInputClass}
                />
              </FormField>
            </div>
          </CreateOrganizationSection>

          <div className="my-8 h-px bg-sportxo-border/70" aria-hidden />

          <CreateOrganizationSection title="Sports Information">
            <div className="grid gap-5 lg:grid-cols-2">
              <FormField
                label="Short Description"
                htmlFor="shortDesc"
                className="lg:col-span-2"
              >
                <Input
                  id="shortDesc"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className={fieldInputClass}
                />
              </FormField>

              <FormField
                label="Bio / About"
                htmlFor="bio"
                className="lg:col-span-2"
              >
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  placeholder="Describe your organization's history, mission, and goals..."
                  className={cn(
                    "w-full resize-y rounded-lg border px-3.5 py-3 text-sm text-sportxo-navy outline-none placeholder:text-sportxo-text-muted focus:border-sportxo-blue focus:ring-2 focus:ring-sportxo-blue/20",
                    fieldInputClass,
                  )}
                />
              </FormField>

              <FormField
                label="Official Website / Webpage"
                htmlFor="website"
                className="lg:col-span-2"
              >
                <div className="relative">
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className={cn(fieldInputClass, "pr-10")}
                  />
                  <Globe
                    className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-sportxo-text-muted"
                    aria-hidden
                  />
                </div>
              </FormField>
            </div>
          </CreateOrganizationSection>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-sportxo-text-muted md:text-sm">
          All information is encrypted and securely stored. You can edit your
          profile after verification.
        </p>

        <div className="mx-auto mt-6 max-w-xl">
          <Button
            type="button"
            className="h-12 w-full text-base font-semibold"
            onClick={onSubmit}
          >
            Submit Registration
            <ArrowRight className="size-5" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold uppercase tracking-wide text-sportxo-text-muted"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
