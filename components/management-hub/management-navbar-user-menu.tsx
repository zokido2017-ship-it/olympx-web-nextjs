"use client";

import { ChevronDown, LogOut, Settings2, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDashboardUser } from "@/components/dashboard/dashboard-user-context";
import { clearStoredDashboardUser } from "@/lib/dashboard-user-storage";
import { cn } from "@/lib/utils";

export function ManagementNavbarUserMenu() {
  const { user } = useDashboardUser();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const close = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex max-w-[220px] min-w-0 items-center gap-2.5 rounded-xl py-1 pl-1 pr-2",
          "text-left transition-colors hover:bg-slate-100/90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm ring-1 ring-slate-200/80">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt="" width={40} height={40} />
          ) : null}
          <AvatarFallback className="text-xs font-bold">{user.initials}</AvatarFallback>
        </Avatar>
        <div className="hidden min-w-0 flex-1 sm:block">
          <p className="truncate text-sm font-bold leading-tight text-slate-900">
            {user.name}
          </p>
          <p className="truncate text-xs font-medium leading-tight text-slate-500">
            {user.email?.trim()
              ? `${user.email.trim()} · ${user.role}`
              : user.role}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 shrink-0 text-slate-400 transition-transform sm:block",
            open ? "rotate-180" : "rotate-0",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-slate-200/90 bg-white py-1 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)]"
        >
          <Link
            href="/profile"
            role="menuitem"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            <UserRound className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            My Profile
          </Link>
          <Link
            href="/organizations/settings"
            role="menuitem"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            <Settings2 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            Settings
          </Link>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50/80"
            onClick={() => {
              setOpen(false);
              clearStoredDashboardUser();
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
