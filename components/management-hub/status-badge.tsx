import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const statusVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      status: {
        active:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
        pending:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
        blocked:
          "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400",
      },
    },
    defaultVariants: {
      status: "active",
    },
  },
);

export type OrgStatusKind = NonNullable<VariantProps<typeof statusVariants>["status"]>;

export interface StatusBadgeProps extends VariantProps<typeof statusVariants> {
  className?: string;
  label?: string;
}

export function StatusBadge({ status, className, label }: StatusBadgeProps) {
  const s = status ?? "active";
  const dotClass =
    s === "active"
      ? "bg-emerald-500"
      : s === "pending"
        ? "bg-amber-500"
        : "bg-rose-500";
  const text =
    label ??
    (s === "active" ? "Active" : s === "pending" ? "Pending" : "Blocked");

  return (
    <span className={cn(statusVariants({ status: s }), className)}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass)} aria-hidden />
      {text}
    </span>
  );
}

export { statusVariants };
