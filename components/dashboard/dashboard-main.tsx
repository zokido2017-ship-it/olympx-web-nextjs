"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { isOrganizationProfileShellPath } from "@/lib/management-nav";

type DashboardMainProps = {
  children: ReactNode;
};

export function DashboardMain({ children }: DashboardMainProps) {
  const pathname = usePathname();
  const isOrgProfile = isOrganizationProfileShellPath(pathname);

  return (
    <motion.div
      key={pathname}
      className="flex flex-1 flex-col overflow-auto"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={isOrgProfile ? "p-0" : "p-8"}>{children}</div>
    </motion.div>
  );
}
