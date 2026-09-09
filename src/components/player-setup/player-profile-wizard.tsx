"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FitnessInformationSection } from "@/components/player-setup/fitness-information-section";
import type {
  FitnessConnectionStatus,
  FitnessProvider,
} from "@/components/player-setup/fitness-information-section";
import { PersonalInformationSection } from "@/components/player-setup/personal-information-section";
import { PlayerProfileWizardFooter } from "@/components/player-setup/player-profile-wizard-footer";
import { PlayerProfileWizardStepper } from "@/components/player-setup/player-profile-wizard-stepper";
import { SportsInformationSection } from "@/components/player-setup/sports-information-section";
import { DASHBOARD_PATH, markPlayerProfileComplete } from "@/lib/auth-session";
import { cn } from "@/lib/cn";

const WIZARD_BODY_PADDING =
  "px-4 py-4 sm:px-8 sm:py-6 md:px-10 lg:px-12 xl:px-14";

const initialConnections: Record<FitnessProvider, FitnessConnectionStatus> = {
  apple: "connected",
  google: "disconnected",
  fitbit: "disconnected",
};

type PlayerProfileWizardProps = {
  onCompleteRedirect?: string;
};

function WizardStepPanel({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full transition-opacity duration-200 ease-out motion-reduce:transition-none",
        active
          ? "relative z-10 opacity-100"
          : "pointer-events-none absolute inset-x-0 top-0 z-0 opacity-0",
      )}
      aria-hidden={!active}
      inert={!active}
    >
      {children}
    </div>
  );
}

export function PlayerProfileWizard({
  onCompleteRedirect = DASHBOARD_PATH,
}: PlayerProfileWizardProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [gender, setGender] = useState("");
  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([]);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [connections, setConnections] =
    useState<Record<FitnessProvider, FitnessConnectionStatus>>(initialConnections);

  const toggleSport = (sportId: string) => {
    setSelectedSportIds((current) =>
      current.includes(sportId)
        ? current.filter((id) => id !== sportId)
        : [...current, sportId],
    );
  };

  const toggleConnection = (provider: FitnessProvider) => {
    setConnections((current) => ({
      ...current,
      [provider]:
        current[provider] === "connected" ? "disconnected" : "connected",
    }));
  };

  const goToStep = (next: number) => {
    setStep(next);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

  const onSaveDraft = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Draft saved");
    setIsSaving(false);
  };

  const onComplete = async () => {
    setIsCompleting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    markPlayerProfileComplete();
    toast.success("Player profile completed");
    setIsCompleting(false);
    router.push(onCompleteRedirect);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:p-2 md:p-4 lg:p-5">
        <div
          className={cn(
            "mx-auto grid w-full max-w-none grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-sportxo-card sm:rounded-[20px] sm:shadow-[0_24px_80px_-32px_rgb(11_31_58_/_0.28)] sm:backdrop-blur-sm",
            "md:h-[min(calc(100dvh-8rem),900px)]",
          )}
        >
          <div className="shrink-0 border-b border-[#EEF2F7] px-4 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 lg:px-12 xl:px-14">
            <PlayerProfileWizardStepper currentStep={step} />
          </div>

          <div className="relative min-h-0 md:overflow-hidden">
            <div
              ref={scrollRef}
              className={cn(
                "md:absolute md:inset-0 md:overflow-y-auto",
                "[-ms-overflow-style:none] [scrollbar-width:thin]",
                WIZARD_BODY_PADDING,
              )}
            >
              <div className="relative w-full">
                <WizardStepPanel active={step === 1}>
                  <PersonalInformationSection
                    wizardMode
                    fullName={fullName}
                    email={email}
                    phoneNumber={phoneNumber}
                    countryCode={countryCode}
                    dateOfBirth={dateOfBirth}
                    nationality={nationality}
                    gender={gender}
                    onFullNameChange={setFullName}
                    onEmailChange={setEmail}
                    onPhoneNumberChange={setPhoneNumber}
                    onCountryCodeChange={setCountryCode}
                    onDateOfBirthChange={setDateOfBirth}
                    onNationalityChange={setNationality}
                    onGenderChange={setGender}
                  />
                </WizardStepPanel>

                <WizardStepPanel active={step === 2}>
                  <SportsInformationSection
                    wizardMode
                    selectedSportIds={selectedSportIds}
                    onToggleSport={toggleSport}
                  />
                </WizardStepPanel>

                <WizardStepPanel active={step === 3}>
                  <FitnessInformationSection
                    wizardMode
                    height={height}
                    weight={weight}
                    onHeightChange={setHeight}
                    onWeightChange={setWeight}
                    connections={connections}
                    onToggleConnection={toggleConnection}
                  />
                </WizardStepPanel>
              </div>
            </div>
          </div>

          <PlayerProfileWizardFooter
            step={step}
            onBack={() => goToStep(step - 1)}
            onSaveDraft={onSaveDraft}
            onContinue={() => goToStep(step + 1)}
            onComplete={onComplete}
            isSaving={isSaving}
            isCompleting={isCompleting}
          />
        </div>
      </div>
    </div>
  );
}
