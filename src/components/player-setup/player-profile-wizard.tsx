"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { SPORTS_CATALOG, type SportOption } from "@/constants/sports-catalog";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  DASHBOARD_PATH,
  getAuthToken,
  getStoredPlayerId,
  isAuthenticated,
  markPlayerProfileComplete,
  setStoredPlayerId,
} from "@/lib/auth-session";
import { cn } from "@/lib/cn";
import {
  clearPlayerWizardDraft,
  readPlayerWizardDraft,
  writePlayerWizardDraft,
} from "@/lib/player-wizard-draft";
import {
  safeSessionGetItem,
  safeSessionRemoveItem,
} from "@/lib/safe-storage";
import {
  applyPlayerToWizardState,
  loadAuthenticatedUser,
  savePlayerWizardStep,
} from "@/services/player-profile-api.service";
import { fetchSportsFromApi } from "@/services/sports-api.service";
import type { SignupSession } from "@/types/auth";
import { SIGNUP_SESSION_STORAGE_KEY } from "@/types/auth";

const WIZARD_BODY_PADDING =
  "px-4 py-4 sm:px-8 sm:py-6 md:px-10 lg:px-12 xl:px-14";

const initialConnections: Record<FitnessProvider, FitnessConnectionStatus> = {
  apple: "disconnected",
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
  if (!active) return null;

  return <div className="w-full">{children}</div>;
}

function readSignupSession(): SignupSession | null {
  const raw = safeSessionGetItem(SIGNUP_SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SignupSession;
  } catch {
    return null;
  }
}

export function PlayerProfileWizard({
  onCompleteRedirect = DASHBOARD_PATH,
}: PlayerProfileWizardProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [playerId, setPlayerId] = useState<number | null>(getStoredPlayerId());
  const [sports, setSports] = useState<SportOption[]>(SPORTS_CATALOG);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [sportsError, setSportsError] = useState<string | null>(null);
  const [usingFallbackCatalog, setUsingFallbackCatalog] = useState(false);

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

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const signupSession = readSignupSession();

      if (signupSession) {
        setFullName(signupSession.fullName ?? "");
        setEmail(signupSession.email ?? "");
        setPhoneNumber(signupSession.phoneNumber ?? "");
        setCountryCode(signupSession.countryCode ?? "+91");
      }

      const localDraft = readPlayerWizardDraft();
      if (localDraft) {
        setStep(localDraft.step);
        setFullName(localDraft.fullName);
        setEmail(localDraft.email);
        setPhoneNumber(localDraft.phoneNumber);
        setCountryCode(localDraft.countryCode);
        setDateOfBirth(localDraft.dateOfBirth);
        setNationality(localDraft.nationality);
        setGender(localDraft.gender);
        setSelectedSportIds(localDraft.selectedSportIds);
        setHeight(localDraft.height);
        setWeight(localDraft.weight);
        setConnections(localDraft.connections as Record<
          FitnessProvider,
          FitnessConnectionStatus
        >);
      }

      if (!isAuthenticated() || !getAuthToken()) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const user = await loadAuthenticatedUser();
        if (!user || cancelled) {
          setIsBootstrapping(false);
          return;
        }

        const storedId = getStoredPlayerId();
        if (storedId) {
          setPlayerId(storedId);
        }

        if (user.player) {
          const applied = applyPlayerToWizardState(user.player);
          if (applied.personal.fullName) setFullName(applied.personal.fullName);
          if (applied.personal.email) setEmail(applied.personal.email);
          setDateOfBirth(applied.personal.dateOfBirth);
          setNationality(applied.personal.nationality);
          setGender(applied.personal.gender);
          setSelectedSportIds(applied.sportIds);
          setHeight(applied.fitness.height);
          setWeight(applied.fitness.weight);
          setConnections(applied.fitness.connections as Record<
            FitnessProvider,
            FitnessConnectionStatus
          >);
          setPlayerId(user.player.id);
          setStoredPlayerId(user.player.id);

          if (!user.player.profile?.profile_complete) {
            setStep(Math.min(Math.max(applied.setupStep, 1), 3));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSports() {
      setSportsLoading(true);
      setSportsError(null);

      try {
        const result = await fetchSportsFromApi();
        if (!cancelled) {
          setSports(result.sports);
          setUsingFallbackCatalog(result.source === "fallback");
        }
      } catch (error) {
        if (!cancelled) {
          setSports(SPORTS_CATALOG);
          setUsingFallbackCatalog(true);
          setSportsError(
            getApiErrorMessage(error, "Could not load sports from the API."),
          );
        }
      } finally {
        if (!cancelled) {
          setSportsLoading(false);
        }
      }
    }

    loadSports();

    return () => {
      cancelled = true;
    };
  }, []);

  const validateStep = useCallback(
    (currentStep: number): string | null => {
      if (currentStep === 1) {
        if (!fullName.trim()) return "Enter your full name.";
        if (!email.trim()) return "Enter your email address.";
        if (!dateOfBirth) return "Select your date of birth.";
        if (!nationality.trim()) return "Enter your nationality.";
        if (!gender) return "Select your gender.";
      }

      if (currentStep === 2 && selectedSportIds.length === 0) {
        return "Select at least one sport.";
      }

      return null;
    },
    [
      dateOfBirth,
      email,
      fullName,
      gender,
      nationality,
      selectedSportIds.length,
    ],
  );

  const saveLocalDraft = useCallback(
    (nextStep: number) => {
      writePlayerWizardDraft({
        step: nextStep,
        fullName,
        email,
        phoneNumber,
        countryCode,
        dateOfBirth,
        nationality,
        gender,
        selectedSportIds,
        height,
        weight,
        connections,
      });
    },
    [
      connections,
      countryCode,
      dateOfBirth,
      email,
      fullName,
      gender,
      height,
      nationality,
      phoneNumber,
      selectedSportIds,
      weight,
    ],
  );

  const persistWizard = useCallback(
    async (nextStep: number, profileComplete: boolean) => {
      saveLocalDraft(nextStep);

      const player = await savePlayerWizardStep({
        playerId,
        personal: {
          fullName,
          email,
          dateOfBirth,
          nationality,
          gender,
        },
        sportIds: selectedSportIds,
        fitness: {
          height,
          weight,
          connections,
        },
        setupStep: nextStep,
        profileComplete,
      });

      if (player) {
        setPlayerId(player.id);
        setStoredPlayerId(player.id);
      }

      return player;
    },
    [
      connections,
      countryCode,
      dateOfBirth,
      email,
      fullName,
      gender,
      height,
      nationality,
      phoneNumber,
      playerId,
      selectedSportIds,
      weight,
    ],
  );

  const onContinue = async () => {
    const validationError = validateStep(step);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const nextStep = step + 1;
    saveLocalDraft(nextStep);
    goToStep(nextStep);

    setIsSaving(true);
    try {
      await persistWizard(nextStep, false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const onComplete = async () => {
    setIsCompleting(true);
    try {
      await persistWizard(3, true);
      clearPlayerWizardDraft();
      safeSessionRemoveItem(SIGNUP_SESSION_STORAGE_KEY);
      markPlayerProfileComplete();
      toast.success("Player profile completed");
      router.push(onCompleteRedirect);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not complete your profile."));
    } finally {
      setIsCompleting(false);
    }
  };

  if (isBootstrapping) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-sportxo-text-muted">
        Loading your profile…
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:p-2 md:p-4 lg:p-5">
        <div
          className={cn(
            "mx-auto flex w-full max-w-none flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-sportxo-card sm:rounded-[20px] sm:shadow-[0_24px_80px_-32px_rgb(11_31_58_/_0.28)] sm:backdrop-blur-sm",
            "md:grid md:h-[min(calc(100dvh-8rem),900px)] md:grid-rows-[auto_1fr_auto]",
          )}
        >
          <div className="shrink-0 border-b border-[#EEF2F7] px-4 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 lg:px-12 xl:px-14">
            <PlayerProfileWizardStepper currentStep={step} />
          </div>

          <div className="relative min-h-0 overflow-hidden">
            <div
              ref={scrollRef}
              className={cn(
                "md:absolute md:inset-0 md:overflow-y-auto",
                "[-ms-overflow-style:none] [scrollbar-width:thin]",
                WIZARD_BODY_PADDING,
              )}
            >
              <div className="relative w-full min-w-0">
                <WizardStepPanel active={step === 1}>
                  <div className="mb-4 space-y-1">
                    <h2 className="text-lg font-bold text-sportxo-navy">
                      Personal Information
                    </h2>
                    <p className="text-sm text-sportxo-text-muted">
                      Tell us about yourself to set up your player profile.
                    </p>
                  </div>
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
                    sports={sports}
                    selectedSportIds={selectedSportIds}
                    onToggleSport={toggleSport}
                    isLoading={sportsLoading}
                    loadError={sportsError}
                    usingFallbackCatalog={usingFallbackCatalog}
                  />
                </WizardStepPanel>

                <WizardStepPanel active={step === 3}>
                  <div className="mb-4 space-y-1">
                    <h2 className="text-lg font-bold text-sportxo-navy">
                      Fitness Information
                    </h2>
                    <p className="text-sm text-sportxo-text-muted">
                      Add your fitness details and connect health platforms.
                    </p>
                  </div>
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
            onContinue={onContinue}
            onComplete={onComplete}
            isSaving={isSaving}
            isCompleting={isCompleting}
          />
        </div>
      </div>
    </div>
  );
}
