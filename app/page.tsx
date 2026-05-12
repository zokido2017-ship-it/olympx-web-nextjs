import { SiteNavbar } from "@/components/layout/site-navbar";

/** Minimal home: navbar only. Auth routes unchanged. */
export default function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteNavbar />
    </div>
  );
}
