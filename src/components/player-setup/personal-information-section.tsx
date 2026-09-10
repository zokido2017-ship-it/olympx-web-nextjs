"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  Calendar,
  Globe,
  Mail,
  UploadCloud,
  UserRound,
  Users,
} from "lucide-react";
import { SetupSectionCard } from "@/components/player-setup/setup-section-card";
import { WizardIconField } from "@/components/player-setup/wizard-icon-field";
import { WizardSelectField } from "@/components/player-setup/wizard-select-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/cn";

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;

const wizardLabelClass = "text-sm font-medium text-[#334155]";

type PersonalInformationSectionProps = {
  fullName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  onDateOfBirthChange: (value: string) => void;
  onNationalityChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  wizardMode?: boolean;
};

function WizardPhotoUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const applyPhotoFile = (file: File) => {
    setPhotoPreview(URL.createObjectURL(file));
  };

  const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) applyPhotoFile(file);
  };

  const onDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) applyPhotoFile(file);
  };

  return (
    <div className="flex justify-center pb-1">
      <button
        type="button"
        aria-label="Upload profile photo"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex size-[96px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors duration-200 sm:size-[112px]",
          isDragging
            ? "border-sportxo-blue bg-[#EFF6FF]"
            : "border-[#CBD5E1] bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] hover:border-sportxo-blue/45 hover:bg-[#F8FAFC]",
        )}
      >
        {photoPreview ? (
          <Image
            src={photoPreview}
            alt="Profile preview"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <>
            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-sportxo-blue shadow-sm">
              <UploadCloud className="size-5" aria-hidden />
            </span>
            <span className="mt-2 text-xs font-semibold text-sportxo-navy">
              Photo
            </span>
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onPhotoChange}
      />
    </div>
  );
}

export function PersonalInformationSection({
  fullName,
  email,
  phoneNumber,
  countryCode,
  dateOfBirth,
  nationality,
  gender,
  onFullNameChange,
  onEmailChange,
  onPhoneNumberChange,
  onCountryCodeChange,
  onDateOfBirthChange,
  onNationalityChange,
  onGenderChange,
  wizardMode = false,
}: PersonalInformationSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  if (wizardMode) {
    return (
      <div className="w-full min-w-0 max-w-none space-y-5 sm:space-y-6">
        <WizardPhotoUpload />

        <div className="flex w-full min-w-0 flex-col space-y-4">
          <div className="w-full min-w-0 space-y-2">
            <Label htmlFor="fullName" className={wizardLabelClass}>
              Full Name
            </Label>
            <WizardIconField
              id="fullName"
              icon={UserRound}
              value={fullName}
              onChange={(event) => onFullNameChange(event.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>

          <div className="w-full space-y-2">
            <Label htmlFor="email" className={wizardLabelClass}>
              Email Address
            </Label>
            <WizardIconField
              id="email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="w-full space-y-2">
            <Label htmlFor="dateOfBirth" className={wizardLabelClass}>
              Date of Birth
            </Label>
            <WizardIconField
              id="dateOfBirth"
              type="date"
              icon={Calendar}
              value={dateOfBirth}
              onChange={(event) => onDateOfBirthChange(event.target.value)}
            />
          </div>

          <div className="w-full space-y-2">
            <Label htmlFor="nationality" className={wizardLabelClass}>
              Nationality
            </Label>
            <WizardIconField
              id="nationality"
              icon={Globe}
              value={nationality}
              onChange={(event) => onNationalityChange(event.target.value)}
              placeholder="e.g. Indian"
            />
          </div>

          <div className="w-full space-y-2">
            <Label htmlFor="gender" className={wizardLabelClass}>
              Gender
            </Label>
            <WizardSelectField
              id="gender"
              icon={Users}
              value={gender}
              onChange={onGenderChange}
              placeholder="Select gender"
              aria-label="Gender"
            >
              {GENDERS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </WizardSelectField>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SetupSectionCard
      step="Section 1"
      title="Personal Information"
      className={undefined}
    >
      <div className="space-y-6">
        <div>
          <Label>Upload Profile Photo</Label>
          <div className="mt-2 flex items-center gap-5">
            <div className="relative size-24 overflow-hidden rounded-2xl border border-sportxo-border bg-[#F3F5F9]">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-sportxo-border bg-sportxo-white px-4 py-2 text-sm font-semibold"
            >
              Upload photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onPhotoChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(event) => onFullNameChange(event.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <PhoneInput
              id="phoneNumber"
              value={phoneNumber}
              onChange={(event) => onPhoneNumberChange(event.target.value)}
              countryCode={countryCode}
              onCountryCodeChange={onCountryCodeChange}
              placeholder="Phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(event) => onDateOfBirthChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              value={nationality}
              onChange={(event) => onNationalityChange(event.target.value)}
              placeholder="e.g. Indian"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Gender</Label>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((option) => {
              const selected = gender === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onGenderChange(option)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                    selected
                      ? "bg-sportxo-blue text-white"
                      : "border border-sportxo-border bg-sportxo-white text-sportxo-navy",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </SetupSectionCard>
  );
}
