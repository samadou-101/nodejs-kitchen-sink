import { Skeleton } from "#components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-2 h-5 w-1/3" />
      </div>
    </div>
  );
}
