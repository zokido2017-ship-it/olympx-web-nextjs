"use client";

import Image from "next/image";

import type { AthleteDashboardData } from "@/types/athlete-dashboard";

type HeroBannerProps = {
  athlete: AthleteDashboardData["athlete"];
};

export function AthleteDashboardHeroBanner({ athlete }: HeroBannerProps) {
  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-slate-200/80">
      <div className="relative min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]">
        <Image
          src={athlete.coverSrc}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, min(100vw - 18rem, 1200px)"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/45 to-slate-900/15" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7 lg:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="relative -mt-14 shrink-0 sm:-mt-16 lg:-mt-[4.25rem]">
              <div className="rounded-2xl border-[5px] border-amber-400 bg-white p-0 shadow-xl sm:border-[6px]">
                <div className="relative h-[5.5rem] w-[5.5rem] overflow-hidden rounded-xl bg-slate-200 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
                  <Image
                    src={athlete.avatarSrc}
                    alt={athlete.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              </div>
            </div>
            <div className="pb-0.5">
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md sm:text-3xl lg:text-4xl">
                {athlete.name}
              </h1>
              <p className="mt-1.5 text-sm font-medium text-white/90">{athlete.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              type="button"
              className="rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/35 backdrop-blur-md transition hover:bg-white/25"
            >
              Connect
            </button>
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            >
              Follow
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
