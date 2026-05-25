import Image from "next/image";
import {
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  ChevronRight,
  Clock,
  Filter,
  Globe,
  MapPin,
  Medal,
  Share2,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { hubCardShell } from "@/lib/management-hub-theme";
import { cn } from "@/lib/utils";

import { OrganizationProfileSectionTabs } from "./organization-profile-section-tabs";

function OlympxLogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("text-blue-600", className)}
      aria-hidden
    >
      <polygon
        fill="currentColor"
        opacity="0.95"
        points="60,8 108,88 12,88"
      />
      <polygon fill="currentColor" opacity="0.65" points="60,28 92,82 28,82" />
      <polygon fill="currentColor" opacity="0.4" points="60,48 78,78 42,78" />
    </svg>
  );
}

function StatTile({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: { text: string; positive: boolean };
}) {
  return (
    <div
      className={cn(
        hubCardShell,
        "relative flex flex-col gap-2 p-6 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.06)]",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <div className="flex items-end gap-3">
        <p className="text-4xl font-black tracking-tight text-slate-900">{value}</p>
        {delta ? (
          <span
            className={cn(
              "mb-1.5 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold",
              delta.positive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600",
            )}
          >
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            {delta.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function PartnerPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex aspect-square items-center justify-center rounded-xl bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400"
      title={label}
    >
      {label.slice(0, 3)}
    </div>
  );
}

export function OrganizationProfileView() {
  return (
    <div className="pb-16">
      {/* Hero / cover */}
      <div className="relative">
        <div className="relative h-[min(340px,42vw)] w-full min-h-[220px] overflow-hidden bg-slate-900">
          <Image
            src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1600&q=80"
            alt=""
            fill
            priority
            className="object-cover object-center brightness-[0.92] contrast-[1.05]"
            sizes="100vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-8">
          <div className="-mt-20 flex flex-col gap-8 lg:-mt-24 lg:flex-row lg:items-end lg:gap-10">
            <div
              className={cn(
                "flex h-40 w-40 shrink-0 items-center justify-center rounded-[20px]",
                "border-[5px] border-white bg-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)]",
              )}
            >
              <OlympxLogoMark className="h-24 w-24" />
            </div>

            <div className="min-w-0 flex-1 space-y-4 pb-2 lg:pb-10">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-[34px]">
                  Olympx Elite
                </h1>
                <BadgeCheck
                  className="h-7 w-7 shrink-0 text-blue-500"
                  strokeWidth={2}
                  aria-label="Verified organization"
                />
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  London, UK
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-slate-400" />
                  olympx.gg
                </span>
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <span className="h-4 w-4 rounded-full bg-slate-200" />
                  <span className="h-4 w-4 rounded-full bg-slate-200" />
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-7 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-600/35 transition-opacity hover:opacity-95"
                >
                  + Follow
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <Share2 className="h-4 w-4" strokeWidth={2} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto mt-12 max-w-[1200px] px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Tournaments" value="42" delta={{ text: "+12%", positive: true }} />
          <StatTile label="Teams" value="12" />
          <StatTile label="Players" value="156" delta={{ text: "+5%", positive: true }} />
          <StatTile label="Sponsors" value="8" />
        </div>
      </div>

      <div className="mt-10">
        <OrganizationProfileSectionTabs />
      </div>

      {/* Main grid */}
      <div className="mx-auto mt-10 grid max-w-[1200px] gap-6 px-8 lg:grid-cols-12">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-3">
          <section className={cn(hubCardShell, "p-6")}>
            <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-900">
              About
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Premier multi-sport organization bridging traditional athletics and esports.
              We develop world-class talent through elite training programs and global
              tournament circuits.
            </p>
            <dl className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="font-bold uppercase tracking-wider text-slate-400">
                  Founded
                </dt>
                <dd className="font-semibold text-slate-800">2018</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-bold uppercase tracking-wider text-slate-400">
                  Headquarters
                </dt>
                <dd className="text-right font-semibold text-slate-800">London, UK</dd>
              </div>
            </dl>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Primary sports
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Soccer", "Basketball", "Valorant"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className={cn(hubCardShell, "p-6")}>
            <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-900">
              Trophy cabinet
            </h2>
            <ul className="mt-4 space-y-4">
              <li className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Trophy className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-900">
                    3× World Championships
                  </p>
                  <p className="text-xs text-slate-500">International circuits</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Medal className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-900">
                    12× Regional medals
                  </p>
                  <p className="text-xs text-slate-500">Domestic leagues</p>
                </div>
              </li>
            </ul>
          </section>

          <section className={cn(hubCardShell, "p-6")}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-900">
                Partners
              </h2>
              <Link
                href="/organizations"
                className="text-[11px] font-bold uppercase tracking-wide text-blue-600 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["Travel", "Gear", "Stream", "Cloud", "Finance", "Auto"].map((p) => (
                <PartnerPlaceholder key={p} label={p} />
              ))}
            </div>
          </section>
        </div>

        {/* Middle — activity */}
        <div className="lg:col-span-5">
          <section className={cn(hubCardShell, "overflow-hidden")}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-900">
                Recent activity
              </h2>
              <button
                type="button"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
                aria-label="Filter activity"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
            <div className="relative px-6 py-6">
              <div
                className="absolute bottom-8 left-[2.35rem] top-10 w-px bg-slate-200"
                aria-hidden
              />
              <ul className="relative space-y-8">
                <li className="relative flex gap-4 pl-2">
                  <span className="relative z-[1] mt-1.5 h-3 w-3 shrink-0 rounded-full border-[3px] border-white bg-blue-500 shadow-sm ring-1 ring-slate-200" />
                  <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Apex Vanguards dominant series finish
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Premier split · Best of 5
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-black text-white shadow-sm">
                        3 – 1 victory
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        vs. Stormline
                      </span>
                    </div>
                  </div>
                </li>
                <li className="relative flex gap-4 pl-2">
                  <span className="relative z-[1] mt-1.5 h-3 w-3 shrink-0 rounded-full border-[3px] border-white bg-blue-500 shadow-sm ring-1 ring-slate-200" />
                  <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      Roster update · Welcome Marcus Thorne
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Apex Vanguards</p>
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/90 p-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-2 ring-white">
                        <Image
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop"
                          alt=""
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          Marcus Thorne
                        </p>
                        <p className="text-xs text-slate-500">Duelist</p>
                      </div>
                      <span className="shrink-0 text-lg font-black text-blue-600">94</span>
                    </div>
                  </div>
                </li>
                <li className="relative flex gap-4 pl-2">
                  <span className="relative z-[1] mt-1.5 h-3 w-3 shrink-0 rounded-full border-[3px] border-white bg-blue-500 shadow-sm ring-1 ring-slate-200" />
                  <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      Tournament entry confirmed
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      Registered for{" "}
                      <span className="font-semibold text-slate-800">
                        Nordic Winter Invitational
                      </span>
                    </p>
                  </div>
                </li>
              </ul>
              <button
                type="button"
                className="mt-6 w-full text-center text-xs font-bold uppercase tracking-[0.14em] text-blue-600 hover:underline"
              >
                Load more activity
              </button>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-4">
          <section
            className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0F172A] p-6 text-white shadow-[0_20px_40px_-16px_rgba(15,23,42,0.6)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Upcoming fixture
            </p>
            <p className="mt-4 text-xl font-black tracking-tight">Oly vs OT</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-400" />
                18:30
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-blue-400" />
                Jan 24, 2024
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">Pro Arena</p>
          </section>

          <section className={cn(hubCardShell, "p-0 overflow-hidden")}>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-900">
                Active rosters
              </h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {[
                { name: "Apex Vanguards", league: "VCL North" },
                { name: "SF United", league: "Regional Open" },
              ].map((row) => (
                <li key={row.name}>
                  <Link
                    href="/teams"
                    className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.league}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={cn(hubCardShell, "p-0 overflow-hidden")}>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-900">
                Star athletes
              </h2>
            </div>
            <ul className="divide-y divide-slate-100">
              {[
                {
                  rank: 1,
                  name: "Jordan Blake",
                  role: "IGL / Flex",
                  ovr: 98,
                  src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&fit=crop",
                },
                {
                  rank: 2,
                  name: "Elena Kovic",
                  role: "Sentinel",
                  ovr: 95,
                  src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&fit=crop",
                },
                {
                  rank: 3,
                  name: "Ryu Park",
                  role: "Controller",
                  ovr: 92,
                  src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop",
                },
              ].map((athlete) => (
                <li key={athlete.name} className="flex items-center gap-3 px-6 py-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">
                    {athlete.rank}
                  </span>
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-100">
                    <Image
                      src={athlete.src}
                      alt=""
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{athlete.name}</p>
                    <p className="text-xs text-slate-500">{athlete.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      OVR
                    </p>
                    <p className="text-lg font-black text-blue-600">{athlete.ovr}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}