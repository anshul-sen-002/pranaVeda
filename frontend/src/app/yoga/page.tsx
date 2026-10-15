import type { Metadata } from "next";
import { Suspense } from "react";

import { LibraryView } from "@/components/library/LibraryView";
import { ContentCardSkeleton } from "@/components/library/ContentCardSkeleton";
import { listCategories, listTags } from "@/lib/api/content";
import type { CategoryDto, TagDto } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Yoga Library | PranaVeda",
  description:
    "Browse asanas, articles, and guided sequences. Search, filter by goal and difficulty, and find the practice that fits today.",
};

/**
 * The taxonomy fetch is uncached, so it must sit inside a <Suspense> boundary
 * — otherwise Next cannot prerender this route at all. The fallback mirrors
 * the filter toolbar + card grid so the layout never jumps.
 */
async function LibraryWithTaxonomy() {
  // Public endpoints — no auth required. Fetch taxonomy server-side so the
  // filter bar has data on first paint. A backend outage degrades gracefully
  // to empty filters rather than breaking the whole page.
  const [categories, tags] = await Promise.all([
    listCategories().catch(() => [] as CategoryDto[]),
    listTags().catch(() => [] as TagDto[]),
  ]);

  return <LibraryView categories={categories} tags={tags} />;
}

function LibraryFallback() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="space-y-4 rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
        <div className="h-10 w-full animate-pulse rounded-xl bg-primary-50" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-primary-50" />
          ))}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function YogaPage() {
  return (
    <Suspense fallback={<LibraryFallback />}>
      <LibraryWithTaxonomy />
    </Suspense>
  );
}

