import { Suspense } from "react";
import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { LibraryView } from "@/components/library/LibraryView";
import { ContentCardSkeleton } from "@/components/library/ContentCardSkeleton";
import { LibraryHero } from "@/components/library/LibraryHero";

export const metadata: Metadata = {
  title: "Yoga Asanas | PranaVeda",
  description: "Explore poses for every level and goal. Find what feels right for your body and mind.",
};

export default function YogaPage() {
  return (
    <AppShell quote="A strong body creates a calm mind.">
      <LibraryHero variant="asanas" />
      <Suspense
        fallback={
          <div className="rounded-2xl border border-[#e6eadd] bg-white/80 p-4 sm:rounded-3xl sm:p-5">
            <div className="h-11 animate-pulse rounded-full bg-primary-50" aria-hidden="true" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <ContentCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <LibraryView />
      </Suspense>
    </AppShell>
  );
}

