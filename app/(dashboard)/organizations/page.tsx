import { Suspense } from "react";

import { OrganizationsDirectory } from "@/components/organizations/organizations-directory";

export default function OrganizationsIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1320px] px-6 py-16 text-sm text-slate-500">
          Loading organizations…
        </div>
      }
    >
      <OrganizationsDirectory />
    </Suspense>
  );
}
