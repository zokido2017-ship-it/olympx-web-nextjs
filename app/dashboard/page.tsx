"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { doc, getDoc } from "firebase/firestore";
import { LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import type { FirebaseError } from "firebase/app";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth-context";
import { logout, mapFirebaseAuthError } from "@/services/auth.service";
import type { UserProfileDoc } from "@/types/user-profile";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = React.useState<Partial<UserProfileDoc> | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);

  React.useEffect(() => {
    if (!loading && !user) {
      toast.info("Sign in to continue.");
      router.replace("/login");
    }
  }, [loading, user, router]);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      try {
        const snap = await getDoc(doc(getFirebaseDb(), "users", user.uid));
        if (!cancelled) {
          if (snap.exists()) {
            setProfile(snap.data() as Partial<UserProfileDoc>);
          } else {
            setProfile({});
          }
        }
      } catch {
        if (!cancelled) {
          toast.error("Could not load profile from Firestore.");
          setProfile({});
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function onLogout() {
    try {
      await logout();
      toast.success("Signed out.");
      router.replace("/login");
    } catch (e) {
      const code = e instanceof Error ? (e as FirebaseError).code : "";
      toast.error(code ? mapFirebaseAuthError(code) : (e as Error).message);
    }
  }

  if (loading || !user) {
    return (
      <div className="relative min-h-dvh bg-[#030711] px-4 py-10">
        <div className="mx-auto max-w-xl space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const primaryId = user.phoneNumber ?? user.email ?? "—";

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#030711] text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_20%_-10%,rgba(115,90,255,0.35),transparent_55%),radial-gradient(780px_circle_at_90%_20%,rgba(236,72,153,0.22),transparent_52%)]" />

      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-600/35 ring-1 ring-white/20">
            <Shield className="h-5 w-5 text-white" aria-hidden />
          </div>
          <p className="text-lg font-semibold">Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="gradient"
            className="rounded-xl"
            type="button"
            onClick={() => void onLogout()}
          >
            <LogOut className="h-4 w-4" aria-hidden /> Log out
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-3xl">
          <CardHeader>
            <CardTitle>{profileLoading ? "Loading profile…" : "Your profile"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-muted-foreground">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Firebase sign-in">{primaryId}</Info>
              <Info label="UID">{user.uid}</Info>
              <Info label="Full name">{profile?.fullName || user.displayName || "—"}</Info>
              <Info label="Email">{profile?.email || user.email || "—"}</Info>
              <Info label="Phone (Firestore)">
                {profile?.phoneNumber || user.phoneNumber || "—"}
              </Info>
              <Info label="Gender">{profile?.gender ?? "—"}</Info>
              <Info label="Auth provider">{profile?.authProvider ?? "—"}</Info>
            </div>
            <Button variant="outline" className="rounded-xl border-white/15" asChild>
              <Link href="/login">Switch account</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
        {label}
      </p>
      <p className="mt-2 break-words font-medium text-foreground">{children}</p>
    </div>
  );
}
