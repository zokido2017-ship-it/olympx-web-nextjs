"use client";

/**
 * Legacy route: OTP lives on `/login` now. Preserve inbound links and bookmarks.
 */
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function VerifyOtpRedirectPage() {
  const router = useRouter();

  React.useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const e164 = qs.get("e164");
    const next = new URLSearchParams();
    next.set("step", "otp");
    if (e164) next.set("e164", e164);
    router.replace(`/login?${next.toString()}`);
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface text-foreground">
      <Loader2
        className="h-8 w-8 animate-spin text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
