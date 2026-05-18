"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-8 bg-surface px-6 py-14 text-center">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-surface via-surface to-surface-container-low"
        aria-hidden
      />
      <div className="relative z-10 max-w-xl space-y-6 rounded-3xl bg-card p-10 shadow-ambient ring-ghost sm:p-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          Something went wrong
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-on-surface sm:text-4xl">
          We couldn&apos;t finish that
        </h1>
        <p className="text-sm leading-[1.5] text-muted-foreground">
          {error.message || "Unexpected error while rendering this page."}
        </p>
        <div className="pt-2">
          <Button
            type="button"
            variant="gradient"
            className="shadow-ambient"
            onClick={() => reset()}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
