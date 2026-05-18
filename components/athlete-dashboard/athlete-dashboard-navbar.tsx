"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, Search, Zap } from "lucide-react";

type NavbarProps = {
  brand: string;
  onOpenSidebar(): void;
};

export function AthleteDashboardNavbar({ brand, onOpenSidebar }: NavbarProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-slate-200 bg-white shadow-sm lg:left-72">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="hidden shrink-0 font-black tracking-tight text-slate-900 sm:block lg:hidden">
          {brand}
        </Link>

        <div className="mx-auto hidden min-w-0 max-w-xl flex-1 md:block lg:max-w-2xl">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search athletes, teams"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Activity"
          >
            <Zap className="h-5 w-5" />
          </button>
          <div className="ml-1 h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-200 sm:h-10 sm:w-10">
            <Image
              src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=128&h=128&fit=crop&q=80"
              alt="User avatar"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-2 md:hidden">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search athletes, teams"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>
    </header>
  );
}
