"use client";

import { useEffect } from "react";

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
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#030711] px-6 py-14 text-center text-foreground">
      <div className="max-w-xl space-y-3 rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/65">
          Error boundary
        </p>
        <h1 className="text-3xl font-semibold">Something misfired</h1>
        <p className="text-muted-foreground">
          {error.message || "Unexpected error while rendering."}
        </p>
      </div>
      <button
        type="button"
        className="rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
