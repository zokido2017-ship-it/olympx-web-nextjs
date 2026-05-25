import Link from "next/link";

import { hubEyebrowClass } from "@/lib/management-hub-theme";
import { getOrganizationBasePath } from "@/lib/management-nav";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OrganizationStaffPage({ params }: Props) {
  const { slug } = await params;
  const overviewHref = getOrganizationBasePath(slug);

  return (
    <div className="mx-auto max-w-[720px] space-y-4 px-8 py-16">
      <p className={hubEyebrowClass}>Organization</p>
      <h1 className="text-3xl font-bold text-slate-900">Staff</h1>
      <p className="text-slate-600">
        This section is coming soon. Return to the{" "}
        <Link href={overviewHref} className="font-semibold text-blue-600 hover:underline">
          organization overview
        </Link>
        .
      </p>
    </div>
  );
}
