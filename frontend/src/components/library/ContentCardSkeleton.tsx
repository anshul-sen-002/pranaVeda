/** Calm loading placeholder that matches the ContentCard footprint. */
export function ContentCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border-soft bg-surface"
      aria-hidden="true"
    >
      <div className="aspect-[16/10] w-full animate-pulse bg-primary-50" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-20 animate-pulse rounded-full bg-primary-50" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-primary-50" />
        <div className="h-4 w-full animate-pulse rounded bg-primary-50" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-primary-50" />
      </div>
    </div>
  );
}
