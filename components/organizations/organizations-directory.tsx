"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, ChevronRight, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import {
  hubCardShell,
  hubEyebrowClass,
  hubPrimaryButtonClass,
} from "@/lib/management-hub-theme";
import { getOrganizationBasePath } from "@/lib/management-nav";
import { cn } from "@/lib/utils";
import {
  isOlympxHttpError,
  olympxListOrganisations,
  type OrganisationListItem,
} from "@/services/olympx-organisations.service";

function locationLabel(org: OrganisationListItem): string {
  const settings = org.settings;
  if (settings && typeof settings.location === "string" && settings.location.trim()) {
    return settings.location.trim();
  }
  return org.website?.replace(/^https?:\/\//i, "") ?? "—";
}

export function OrganizationsDirectory() {
  const searchParams = useSearchParams();
  const [orgs, setOrgs] = React.useState<OrganisationListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const createdToastShown = React.useRef(false);

  React.useEffect(() => {
    const created = searchParams.get("created");
    if (!created || createdToastShown.current) return;
    createdToastShown.current = true;
    const name =
      created === "1"
        ? "Your organization"
        : orgs.find((o) => o.slug === created)?.name ?? created;
    toast.success("Organization created", {
      description: `${name} is now in your directory.`,
    });
  }, [searchParams, orgs]);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await olympxListOrganisations();
        if (!cancelled) setOrgs(list);
      } catch (e) {
        if (!cancelled) {
          const msg =
            isOlympxHttpError(e) && e.status === 401
              ? "Sign in to view your organizations."
              : e instanceof Error
                ? e.message
                : "Could not load organizations.";
          setError(msg);
          setOrgs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading organizations…
          </div>
        ) : error ? (
          <p className="px-6 py-10 text-sm font-medium text-rose-700" role="alert">
            {error}
          </p>
        ) : orgs.length === 0 ? (
          <p className="px-6 py-10 text-sm text-slate-600">
            No organizations yet. Create your first organization to get started.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {orgs.map((org) => (
              <li key={org.id}>
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
                      <p className="text-sm text-slate-500">{locationLabel(org)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {typeof org.teams_count === "number" ? (
                      <span>
                        {org.teams_count}{" "}
                        <span className="font-bold text-slate-400">teams</span>
                      </span>
                    ) : null}
                    <ChevronRight className="h-4 w-4 text-slate-300" aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

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
