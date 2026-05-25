"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { BasicInformationCard } from "@/components/create-organisation/basic-information-card";
import { CreateOrganizationHeader } from "@/components/create-organisation/create-organization-header";
import { HierarchyPreviewCard } from "@/components/create-organisation/hierarchy-preview-card";
import { ProfileBrandingCard } from "@/components/create-organisation/profile-branding-card";
import { SocialPresenceCard } from "@/components/create-organisation/social-presence-card";
import { ORG_PROFILE_SLUG_DEFAULT, getOrganizationBasePath } from "@/lib/management-nav";

export function CreateOrganisationView() {
  const router = useRouter();
  const [orgName, setOrgName] = React.useState("");
  const [handle, setHandle] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [headquarters, setHeadquarters] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [twitter, setTwitter] = React.useState("");
  const [instagram, setInstagram] = React.useState("");

  const [bannerPreview, setBannerPreview] = React.useState<string | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  const [showValidation, setShowValidation] = React.useState(false);
  const [draftSavedAt, setDraftSavedAt] = React.useState<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [bannerPreview, logoPreview]);

  const onBannerSelected = React.useCallback((file: File | null) => {
    setBannerPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  const onLogoSelected = React.useCallback((file: File | null) => {
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  const displayName = orgName.trim() || "Your Org Name";

  const errors = {
    orgName: !orgName.trim(),
    handle: !handle.trim(),
    category: !category,
  };

  const handleSaveDraft = React.useCallback(() => {
    setDraftSavedAt(Date.now());
    setShowValidation(false);
  }, []);

  const handlePublish = React.useCallback(() => {
    setShowValidation(true);
    const nameOk = orgName.trim().length > 0;
    const handleOk = handle.trim().length > 0;
    const categoryOk = category.length > 0;
    if (!nameOk || !handleOk || !categoryOk) return;
    setDraftSavedAt(null);
    router.push(getOrganizationBasePath(ORG_PROFILE_SLUG_DEFAULT));
  }, [orgName, handle, category, router]);

  const headerNotice = draftSavedAt ? (
    <p
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
      role="status"
    >
      Draft saved locally — you can continue editing anytime.
    </p>
  ) : showValidation && (errors.orgName || errors.handle || errors.category) ? (
    <p
      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900"
      role="alert"
    >
      Please complete the required fields: organization name, unique handle, and category.
    </p>
  ) : null;

  return (
    <div className="mx-auto max-w-[1320px] space-y-8 pb-10 font-sans">
      <CreateOrganizationHeader
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        headerNotice={headerNotice}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <ProfileBrandingCard
            orgName={orgName}
            onOrgNameChange={setOrgName}
            handle={handle}
            onHandleChange={setHandle}
            bannerPreview={bannerPreview}
            logoPreview={logoPreview}
            onBannerSelected={onBannerSelected}
            onLogoSelected={onLogoSelected}
            showErrors={showValidation}
            errors={errors}
          />
          <BasicInformationCard
            bio={bio}
            onBioChange={setBio}
            category={category}
            onCategoryChange={setCategory}
            headquarters={headquarters}
            onHeadquartersChange={setHeadquarters}
            showErrors={showValidation}
            categoryError={errors.category}
          />
        </div>

        <div className="space-y-6 lg:col-span-4">
          <SocialPresenceCard
            website={website}
            onWebsiteChange={setWebsite}
            twitter={twitter}
            onTwitterChange={setTwitter}
            instagram={instagram}
            onInstagramChange={setInstagram}
          />
          <HierarchyPreviewCard displayName={displayName} />
        </div>
      </div>
    </div>
  );
}
