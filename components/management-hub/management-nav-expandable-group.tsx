"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/utils";

export type ManagementNavSubItem = {
  href: string;
  label: string;
};

type ManagementNavExpandableGroupProps = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** e.g. "/organizations" — auto-expands when pathname is under this prefix */
  pathPrefix: string;
  subItems: ManagementNavSubItem[];
  /** localStorage key for open/closed preference */
  storageKey: string;
};

function isSubActive(pathname: string, href: string) {
  if (pathname === href || pathname === `${href}/`) return true;
  const isRootListing = href === "/organizations" || href === "/teams";
  if (isRootListing) return false;
  return pathname.startsWith(`${href}/`);
}

export function ManagementNavExpandableGroup({
  id,
  label,
  icon: Icon,
  pathPrefix,
  subItems,
  storageKey,
}: ManagementNavExpandableGroupProps) {
  const pathname = usePathname();
  const sectionActive =
    pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`);

  const childActive = subItems.some((s) => isSubActive(pathname, s.href));

  const [open, setOpen] = React.useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const v = window.localStorage.getItem(storageKey);
      if (v === "0") return false;
      if (v === "1") return true;
    } catch {
      /* ignore */
    }
    return true;
  });

  React.useEffect(() => {
    if (sectionActive) setOpen(true);
  }, [sectionActive]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const parentRowActive = childActive;

  return (
    <div className="flex flex-col gap-0.5">
      <div
        className={cn(
          "group relative flex w-full items-center rounded-r-lg py-2.5 pl-4 pr-3 text-sm font-medium transition-colors",
          parentRowActive
            ? "bg-sky-50/80 text-blue-600 shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        {parentRowActive ? (
          <span
            className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l bg-blue-600"
            aria-hidden
          />
        ) : null}
        <button
          type="button"
          id={`${id}-toggle`}
          onClick={toggle}
          className="relative z-[1] flex w-full flex-1 items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-expanded={open}
          aria-controls={`${id}-submenu`}
        >
          <Icon
            className={cn(
              "h-5 w-5 shrink-0",
              parentRowActive
                ? "text-blue-600"
                : "text-slate-400 group-hover:text-slate-600",
            )}
            aria-hidden
          />
          <span className="flex-1">{label}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ease-out motion-reduce:transition-none",
              open ? "rotate-180" : "rotate-0",
            )}
            aria-hidden
          />
        </button>
      </div>

      <div
        id={`${id}-submenu`}
        role="region"
        aria-labelledby={`${id}-toggle`}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="mt-0.5 space-y-0.5 pb-1 pl-2" role="list">
            {subItems.map((item) => {
              const active = isSubActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center rounded-r-lg py-2 pl-9 pr-3 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-sky-50/80 text-blue-600 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    {active ? (
                      <span
                        className="absolute right-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-l bg-blue-600"
                        aria-hidden
                      />
                    ) : null}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
