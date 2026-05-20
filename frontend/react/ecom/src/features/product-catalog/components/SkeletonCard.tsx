export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border p-4">
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-3 w-full rounded bg-muted" />
      <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
      <div className="mt-4 h-5 w-1/3 rounded bg-muted" />
    </div>
  );
}
