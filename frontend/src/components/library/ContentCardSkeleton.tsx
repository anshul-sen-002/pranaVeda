/** Calm loading placeholder that matches the ContentCard footprint. */
export function ContentCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#e3ebe1] bg-white p-2.5 sm:rounded-3xl sm:p-3"
      aria-hidden="true"
    >
      <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-primary-50 sm:rounded-2xl" />
      <div className="space-y-2.5 px-1.5 pt-3 pb-2 sm:px-2">
        <div className="h-5 w-24 animate-pulse rounded-full bg-primary-50" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-primary-50" />
        <div className="h-3 w-full animate-pulse rounded bg-primary-50" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-primary-50" />
      </div>
    </div>
  );
}
