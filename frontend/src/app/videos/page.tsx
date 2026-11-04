import { Suspense } from "react";
import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { LibraryHero } from "@/components/library/LibraryHero";
import { LibraryView } from "@/components/library/LibraryView";
import { ContentCardSkeleton } from "@/components/library/ContentCardSkeleton";

export const metadata: Metadata = {
  title: "Yoga Videos | PranaVeda",
  description: "Guided practice videos you can follow along with, at any level — no sign-in needed to watch.",
};

/** Public video library. Published videos remain available without an account. */
export default function YogaVideosPage() {
  return (
    <AppShell quote="Flow with your breath, one video at a time.">
      <LibraryHero variant="videos" />
      <Suspense
        fallback={
          <div className="rounded-2xl border border-[#e6eadd] bg-white/80 p-4 sm:rounded-3xl sm:p-5">
            <div className="h-11 animate-pulse rounded-full bg-primary-50" aria-hidden="true" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => <ContentCardSkeleton key={index} />)}
            </div>
          </div>
        }
      >
        <LibraryView fixedType="VIDEO" />
      </Suspense>
    </AppShell>
  );
}
