import Link from "next/link";

import { hubCardShell, hubEyebrowClass } from "@/lib/management-hub-theme";
import { ORG_PROFILE_SLUG_DEFAULT, getOrganizationBasePath } from "@/lib/management-nav";
import { cn } from "@/lib/utils";

export default function OrganizationSettingsPage() {
  const profileHref = getOrganizationBasePath(ORG_PROFILE_SLUG_DEFAULT);

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <div className="space-y-2">
        <p className={hubEyebrowClass}>Organizations</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Organization settings
        </h1>
        <p className="text-slate-600">
          Configure licenses, billing, and federation links for your organizations.
        </p>
      </div>

      <section className={cn(hubCardShell, "p-6")}>
        <p className="text-sm text-slate-600">
          Detailed settings controls will be connected here. Open the{" "}
          <Link href={profileHref} className="font-semibold text-blue-600 hover:underline">
            organization profile
          </Link>{" "}
          for branding and visibility, or return to{" "}
          <Link href="/organizations" className="font-semibold text-blue-600 hover:underline">
            all organizations
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
