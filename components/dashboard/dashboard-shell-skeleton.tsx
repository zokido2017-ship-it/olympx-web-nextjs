import { Skeleton } from "@/components/ui/skeleton";

/** Matches athlete dashboard chrome while auth or route segment loads. */
export function DashboardShellSkeleton() {
  return (
    <div className="min-h-dvh bg-[#f3f4f6] antialiased">
      <div className="flex min-h-dvh">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200/60 bg-slate-50 lg:block">
          <div className="space-y-5 p-6">
            <Skeleton className="h-8 w-28 rounded-md bg-slate-200/90" />
            <Skeleton className="h-24 w-full rounded-xl bg-slate-200/90" />
            <Skeleton className="h-11 w-full rounded-xl bg-slate-200/90" />
            <div className="space-y-2 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg bg-slate-200/90" />
              ))}
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <Skeleton className="h-16 w-full shrink-0 rounded-none bg-white shadow-sm" />
          <div className="flex-1 space-y-6 p-4 pb-12 pt-[8rem] md:px-6 md:pt-16 lg:px-8">
            <Skeleton className="h-56 w-full rounded-3xl bg-slate-200/90 md:h-64" />
            <Skeleton className="h-28 w-full rounded-xl bg-white shadow-sm" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl bg-white shadow-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
