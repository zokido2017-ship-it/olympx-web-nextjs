import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="relative min-h-dvh bg-[#030711] px-4 py-10">
      <div className="mx-auto grid max-w-4xl gap-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
