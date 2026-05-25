import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";

import {
  hubCardShell,
  hubEyebrowClass,
  hubPrimaryButtonClass,
} from "@/lib/management-hub-theme";
import { ORG_PROFILE_SLUG_DEFAULT, getOrganizationBasePath } from "@/lib/management-nav";
import { cn } from "@/lib/utils";

const SAMPLE_ORGS = [
  {
    slug: ORG_PROFILE_SLUG_DEFAULT,
    name: "Olympx Elite",
    location: "London, UK",
    teams: 12,
    players: 156,
  },
  {
    slug: "northwind-athletic",
    name: "Northwind Athletic Union",
    location: "Pacific Northwest",
    teams: 42,
    players: 1420,
  },
  {
    slug: "metro-elite-training",
    name: "Metro Elite Training",
    location: "Chicago, USA",
    teams: 18,
    players: 640,
  },
];

export default function OrganizationsIndexPage() {
  return (
    <div className="mx-auto max-w-[1320px] space-y-8">
      <header className="space-y-3">
        <p className={hubEyebrowClass}>Management hub</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          All organizations
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-600">
          Review and open organization profiles, licenses, and operational structure.
        </p>
      </header>

      <section className={hubCardShell}>
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Directory
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Select an organization to open its public profile dashboard.
          </p>
        </div>
        <ul className="divide-y divide-slate-100">
          {SAMPLE_ORGS.map((org) => (
            <li key={org.slug}>
              <Link
                href={getOrganizationBasePath(org.slug)}
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                    <Building2 className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{org.name}</p>
                    <p className="text-sm text-slate-500">{org.location}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <span>
                    {org.teams}{" "}
                    <span className="font-bold text-slate-400">teams</span>
                  </span>
                  <span>
                    {org.players.toLocaleString()}{" "}
                    <span className="font-bold text-slate-400">players</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" aria-hidden />
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-100 px-6 py-4">
          <Link
            href="/organizations/create"
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold",
              hubPrimaryButtonClass,
            )}
          >
            Create organization
          </Link>
        </div>
      </section>
    </div>
  );
}
