"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { BasicInformationCard } from "@/components/create-organisation/basic-information-card";
import { CreateOrganizationHeader } from "@/components/create-organisation/create-organization-header";
import { HierarchyPreviewCard } from "@/components/create-organisation/hierarchy-preview-card";
import { ProfileBrandingCard } from "@/components/create-organisation/profile-branding-card";
import { SocialPresenceCard } from "@/components/create-organisation/social-presence-card";
import { useOlympxAuth } from "@/hooks/use-olympx-auth";
import { ensureCreateSession } from "@/lib/olympx/ensure-create-session";
import { readOlympxAccessToken } from "@/lib/olympx/session";
import {
  safeSessionStorageGet,
  safeSessionStorageRemove,
  safeSessionStorageSet,
} from "@/lib/safe-web-storage";
import {
  createOrganisationSchema,
  type CreateOrganisationFieldErrors,
} from "@/lib/validations/organisation";
import {
  isOlympxHttpError,
  isOlympxOrganisationValidationError,
  olympxCreateOrganisation,
} from "@/services/olympx-organisations.service";

const CREATE_ORG_DRAFT_KEY = "olympx-create-org-draft";
const CREATE_ORG_AUTO_PUBLISH_KEY = "olympx-create-org-autopublish";

type CreateOrgDraft = {
  orgName: string;
  handle: string;
  bio: string;
  category: string;
  headquarters: string;
  website: string;
  twitter: string;
  instagram: string;
};

function readCreateOrgDraft(): CreateOrgDraft | null {
  const raw = safeSessionStorageGet(CREATE_ORG_DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CreateOrgDraft;
  } catch {
    return null;
  }
}

function writeCreateOrgDraft(draft: CreateOrgDraft): void {
  safeSessionStorageSet(CREATE_ORG_DRAFT_KEY, JSON.stringify(draft));
}

function clearCreateOrgDraft(): void {
  safeSessionStorageRemove(CREATE_ORG_DRAFT_KEY);
}

function readAutoPublishFlag(): boolean {
  return safeSessionStorageGet(CREATE_ORG_AUTO_PUBLISH_KEY) === "1";
}

function setAutoPublishFlag(): void {
  safeSessionStorageSet(CREATE_ORG_AUTO_PUBLISH_KEY, "1");
}

function clearAutoPublishFlag(): void {
  safeSessionStorageRemove(CREATE_ORG_AUTO_PUBLISH_KEY);
}

export function CreateOrganisationView() {
  const router = useRouter();
  const { token: authToken, refresh, ready, isAuthenticated } = useOlympxAuth();
  const [orgName, setOrgName] = React.useState("");
  const [handle, setHandle] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [category, setCategory] = React.useState("pro");
  const [headquarters, setHeadquarters] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [twitter, setTwitter] = React.useState("");
  const [instagram, setInstagram] = React.useState("");

  const [bannerPreview, setBannerPreview] = React.useState<string | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [bannerFile, setBannerFile] = React.useState<File | null>(null);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);

  const [showValidation, setShowValidation] = React.useState(false);
  const [fieldErrors, setFieldErrors] =
    React.useState<CreateOrganisationFieldErrors>({});
  const [draftSavedAt, setDraftSavedAt] = React.useState<number | null>(null);
  const [publishing, setPublishing] = React.useState(false);
  const [pendingAutoPublish, setPendingAutoPublish] = React.useState(false);

  React.useEffect(() => {
    const draft = readCreateOrgDraft();
    const shouldAutoPublish = readAutoPublishFlag();
    if (shouldAutoPublish) {
      clearAutoPublishFlag();
    }
    if (!draft) return;

    queueMicrotask(() => {
      setOrgName(draft.orgName);
      setHandle(draft.handle);
      setBio(draft.bio);
      setCategory(draft.category);
      setHeadquarters(draft.headquarters);
      setWebsite(draft.website);
      setTwitter(draft.twitter);
      setInstagram(draft.instagram);
      if (shouldAutoPublish) {
        setPendingAutoPublish(true);
      }
    });
    clearCreateOrgDraft();
    toast.message("Draft restored", {
      description: shouldAutoPublish
        ? "Publishing your organization now that you are signed in…"
        : "Your organization details were kept after sign-in.",
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [bannerPreview, logoPreview]);

  const onBannerSelected = React.useCallback((file: File | null) => {
    setBannerFile(file);
    setBannerPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  const onLogoSelected = React.useCallback((file: File | null) => {
    setLogoFile(file);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  const displayName = orgName.trim() || "Your Org Name";

  const clearFieldError = React.useCallback(
    (field: keyof CreateOrganisationFieldErrors) => {
      setFieldErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const handleSaveDraft = React.useCallback(() => {
    writeCreateOrgDraft({
      orgName,
      handle,
      bio,
      category,
      headquarters,
      website,
      twitter,
      instagram,
    });
    setDraftSavedAt(Date.now());
    setShowValidation(false);
    setFieldErrors({});
    toast.success("Draft saved", {
      description: "Your progress is stored in this browser until you publish.",
    });
  }, [orgName, handle, bio, category, headquarters, website, twitter, instagram]);

  const handlePublish = React.useCallback(async () => {
    if (!ready) {
      toast.message("One moment…", {
        description: "Checking your sign-in status.",
      });
      return;
    }

    setShowValidation(true);
    setFieldErrors({});

    const parsed = createOrganisationSchema.safeParse({
      orgName,
      handle,
      bio: bio || undefined,
      category,
      headquarters: headquarters || undefined,
      website: website || undefined,
      twitter: twitter || undefined,
      instagram: instagram || undefined,
    });

    if (!parsed.success) {
      const nextErrors: CreateOrganisationFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (
          typeof key === "string" &&
          !nextErrors[key as keyof CreateOrganisationFieldErrors]
        ) {
          nextErrors[key as keyof CreateOrganisationFieldErrors] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    refresh();
    const { token, canCreate } = await ensureCreateSession(authToken);

    if (!canCreate && !isAuthenticated) {
      writeCreateOrgDraft({
        orgName,
        handle,
        bio,
        category,
        headquarters,
        website,
        twitter,
        instagram,
      });
      setAutoPublishFlag();
      toast.error("Sign in required", {
        description:
          "Log in with OTP — your form details will be restored when you return.",
      });
      router.push(`/login?next=${encodeURIComponent("/organizations/create")}`);
      return;
    }

    setPublishing(true);
    setDraftSavedAt(null);

    const draftPayload = {
      name: parsed.data.orgName,
      handle: parsed.data.handle,
      bio: parsed.data.bio,
      category: parsed.data.category,
      headquarters: parsed.data.headquarters,
      website: parsed.data.website,
      twitter: parsed.data.twitter,
      instagram: parsed.data.instagram,
      logoFile,
      bannerFile,
    };

    try {
      const created = await olympxCreateOrganisation(draftPayload, {
        accessToken: token,
      });

      clearCreateOrgDraft();
      toast.success("Organization published", {
        description:
          logoFile || bannerFile
            ? `${parsed.data.orgName} is live. Logo and banner can be updated from organization settings later.`
            : `${parsed.data.orgName} is live.`,
      });
      const dest =
        created.slug.length > 0
          ? `/organizations?created=${encodeURIComponent(created.slug)}`
          : "/organizations?created=1";
      window.location.replace(dest);
    } catch (e) {
      if (isOlympxOrganisationValidationError(e)) {
        setFieldErrors(e.fieldErrors);
        toast.error("Fix the highlighted fields", {
          description: e.message,
        });
        return;
      }

      const msg =
        e instanceof Error ? e.message : "Could not create organization.";

      if (isOlympxHttpError(e) && e.status === 403) {
        toast.error("Permission denied", {
          description:
            msg ||
            "Your account cannot create organizations. Contact an administrator.",
        });
        return;
      }

      if (isOlympxHttpError(e) && e.status === 401) {
        const retrySession = await ensureCreateSession(authToken);
        if (retrySession.canCreate) {
          try {
            const created = await olympxCreateOrganisation(draftPayload, {
              accessToken: retrySession.token,
            });
            clearCreateOrgDraft();
            toast.success("Organization published", {
              description: `${parsed.data.orgName} is live.`,
            });
            const dest =
              created.slug.length > 0
                ? `/organizations?created=${encodeURIComponent(created.slug)}`
                : "/organizations?created=1";
            window.location.replace(dest);
            return;
          } catch {
            /* fall through to sign-in prompt */
          }
        }

        writeCreateOrgDraft({
          orgName,
          handle,
          bio,
          category,
          headquarters,
          website,
          twitter,
          instagram,
        });
        setAutoPublishFlag();
        toast.error("Sign in required", {
          description:
            "Log in with OTP — your form details will be restored when you return.",
        });
        router.push(
          `/login?next=${encodeURIComponent("/organizations/create")}`,
        );
        return;
      }

      toast.error(msg);
    } finally {
      setPublishing(false);
    }
  }, [
    ready,
    orgName,
    handle,
    bio,
    category,
    headquarters,
    website,
    twitter,
    instagram,
    logoFile,
    bannerFile,
    authToken,
    isAuthenticated,
    refresh,
    router,
  ]);

  React.useEffect(() => {
    if (!ready || !pendingAutoPublish || publishing) return;
    if (!isAuthenticated && !readOlympxAccessToken()) return;
    if (!orgName.trim()) return;

    queueMicrotask(() => {
      setPendingAutoPublish(false);
      void handlePublish();
    });
  }, [
    ready,
    pendingAutoPublish,
    publishing,
    isAuthenticated,
    orgName,
    handlePublish,
  ]);

  const headerNotice = draftSavedAt ? (
    <p
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
      role="status"
    >
      Draft saved locally — you can continue editing anytime.
    </p>
  ) : showValidation && Object.keys(fieldErrors).length > 0 ? (
    <p
      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900"
      role="alert"
    >
      Please fix the highlighted fields before publishing.
    </p>
  ) : null;

  return (
    <div className="mx-auto max-w-[1320px] space-y-8 pb-10 font-sans">
      <CreateOrganizationHeader
        onSaveDraft={handleSaveDraft}
        onPublish={() => void handlePublish()}
        publishing={publishing}
        headerNotice={headerNotice}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <ProfileBrandingCard
            orgName={orgName}
            onOrgNameChange={(v) => {
              setOrgName(v);
              clearFieldError("orgName");
            }}
            handle={handle}
            onHandleChange={(v) => {
              setHandle(v);
              clearFieldError("handle");
            }}
            bannerPreview={bannerPreview}
            logoPreview={logoPreview}
            onBannerSelected={onBannerSelected}
            onLogoSelected={onLogoSelected}
            showErrors={showValidation}
            fieldErrors={fieldErrors}
          />
          <BasicInformationCard
            bio={bio}
            onBioChange={(v) => {
              setBio(v);
              clearFieldError("bio");
            }}
            category={category}
            onCategoryChange={(v) => {
              setCategory(v);
              clearFieldError("category");
            }}
            headquarters={headquarters}
            onHeadquartersChange={(v) => {
              setHeadquarters(v);
              clearFieldError("headquarters");
            }}
            showErrors={showValidation}
            fieldErrors={fieldErrors}
          />
        </div>

        <div className="space-y-6 lg:col-span-4">
          <SocialPresenceCard
            website={website}
            onWebsiteChange={(v) => {
              setWebsite(v);
              clearFieldError("website");
            }}
            twitter={twitter}
            onTwitterChange={(v) => {
              setTwitter(v);
              clearFieldError("twitter");
            }}
            instagram={instagram}
            onInstagramChange={(v) => {
              setInstagram(v);
              clearFieldError("instagram");
            }}
            showErrors={showValidation}
            fieldErrors={fieldErrors}
          />
          <HierarchyPreviewCard displayName={displayName} />
        </div>
      </div>
    </div>
  );
}
