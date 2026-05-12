"use client";

import { getMissingFirebasePublicEnvVars } from "@/lib/firebase/env";

/** Shown when `NEXT_PUBLIC_FIREBASE_*` vars are missing or still set to `.env.example` placeholders. */
export function FirebaseMissingConfigBanner() {
  const missing = getMissingFirebasePublicEnvVars();

  if (missing.length === 0) return null;

  return (
    <div
      className="mb-6 rounded-2xl border border-amber-500/35 bg-amber-500/[0.12] px-4 py-3 text-left text-[13px] leading-relaxed text-amber-50 shadow-inner shadow-black/30"
      role="alert"
    >
      <p className="font-semibold text-amber-100">Firebase is not configured</p>
      <p className="mt-2 text-amber-100/90">
        Create <code className="rounded-md bg-black/35 px-1.5 py-0.5 font-mono text-[12px]">.env.local</code> in the project root, copy{" "}
        <code className="rounded-md bg-black/35 px-1.5 py-0.5 font-mono text-[12px]">.env.example</code> into it,
        paste your Firebase Web App config values, then restart{" "}
        <code className="rounded-md bg-black/35 px-1.5 py-0.5 font-mono text-[12px]">npm run dev</code>
        {" "}(Next.js reads env vars at startup).
      </p>
      <p className="mt-3 text-[12px] text-amber-200/90">
        Still missing or using placeholder strings:{" "}
        <span className="font-mono">{missing.join(", ")}</span>
      </p>
      <p className="mt-2 text-[12px] text-amber-200/85">
        Get values from Firebase Console → Project settings → Your apps → Web app config SDK snippet.
      </p>
    </div>
  );
}
