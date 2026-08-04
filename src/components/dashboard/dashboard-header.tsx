"use client";

import { Menu } from "lucide-react";
import { getDashboardPageTitle } from "@/constants/dashboard-nav";
import { Button } from "@/components/ui/shadcn-button";

type DashboardHeaderProps = {
  pathname: string;
  onOpenMobileNav: () => void;
};

export function DashboardHeader({
  pathname,
  onOpenMobileNav,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu className="size-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {getDashboardPageTitle(pathname)}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Manage teams and organizations
          </p>
        </div>
      </div>
    </header>
  );
}
