import Image from "next/image";
import {
  Activity,
  Calendar,
  ChevronRight,
  MapPin,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { hubCardShell, hubEyebrowClass } from "@/lib/management-hub-theme";
import { getOrganizationBasePath, ORG_PROFILE_SLUG_DEFAULT } from "@/lib/management-nav";
import { cn } from "@/lib/utils";

const PLAYERS = [
  { name: "Marcus Thorne", role: "Duelist", ovr: 94 },
  { name: "Elena Kovic", role: "Sentinel", ovr: 91 },
  { name: "Jordan Blake", role: "IGL", ovr: 89 },
];

const UPCOMING = [
  { opponent: "Stormline GC", date: "Jan 26", time: "19:00", venue: "Pro Arena" },
  { opponent: "Harbor City", date: "Feb 2", time: "18:30", venue: "Online" },
];

type TeamProfileViewProps = {
  slug: string;
  displayName?: string;
};

export function TeamProfileView({ slug, displayName }: TeamProfileViewProps) {
  const title = displayName ?? slug.replace(/-/g, " ");
  const orgHref = getOrganizationBasePath(ORG_PROFILE_SLUG_DEFAULT);

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-900 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.2)]">
        <div className="relative h-[200px] w-full sm:h-[240px]">
          <Image
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1400&q=80"
            alt=""
            fill
            className="object-cover opacity-90"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>
        <div className="relative flex flex-col gap-6 px-6 pb-6 pt-0 sm:flex-row sm:items-end sm:px-8">
          <div className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-white shadow-xl sm:h-28 sm:w-28">
            <Trophy className="h-12 w-12 text-blue-600" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1 pb-1 text-white">
            <p className={cn(hubEyebrowClass, "text-blue-300")}>Team profile</p>
            <h1 className="mt-2 text-3xl font-black capitalize tracking-tight sm:text-4xl">
              {title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                VCL North · {slug}
              </span>
              <Link
                href={orgHref}
                className="font-semibold text-blue-300 hover:text-white hover:underline"
              >
                Parent org
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:pb-1">
            <Link
              href="/teams/stats"
              className="inline-flex h-10 items-center rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Team stats
            </Link>
            <Link
              href="/teams/schedule"
              className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-600/90"
            >
              Schedule
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Win rate", value: "68%" },
          { label: "Roster", value: `${PLAYERS.length + 9} players` },
          { label: "League rank", value: "#3" },
        ].map((s) => (
          <div key={s.label} className={cn(hubCardShell, "p-5")}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className={cn(hubCardShell, "overflow-hidden lg:col-span-7")}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Players
            </h2>
            <Link
              href="/players"
              className="text-xs font-bold uppercase tracking-wide text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {PLAYERS.map((p) => (
              <li key={p.name} className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                  {p.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-500">{p.role}</p>
                </div>
                <Badge variant="default" className="font-bold normal-case tracking-normal">
                  OVR {p.ovr}
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className={cn(hubCardShell, "overflow-hidden lg:col-span-5")}>
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Upcoming
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {UPCOMING.map((row) => (
              <li key={row.date + row.opponent} className="px-6 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">vs {row.opponent}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {row.date} · {row.time}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">{row.venue}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={cn(hubCardShell, "p-6")}>
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Activity className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Recent activity
          </h2>
        </div>
        <ul className="mt-4 space-y-4 text-sm text-slate-600">
          <li className="flex gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
            <span>
              <span className="font-semibold text-slate-900">Match result:</span> 3–1 victory vs
              Stormline — series sealed.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
            <span>
              <span className="font-semibold text-slate-900">Roster:</span> Marcus Thorne
              confirmed starting duelist.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
            <span>
              <span className="font-semibold text-slate-900">Practice:</span> VOD review scheduled
              with coaching staff.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
