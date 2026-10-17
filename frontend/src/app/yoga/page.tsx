import { Suspense } from "react";
import type { Metadata } from "next";

import { AppShell } from "@/components/layout/AppShell";
import { LibraryView } from "@/components/library/LibraryView";
import { ContentCardSkeleton } from "@/components/library/ContentCardSkeleton";
import { AsanaHero } from "@/components/library/AsanaHero";

export const metadata: Metadata = {
  title: "Yoga Asanas | PranaVeda",
  description: "Explore poses for every level and goal. Find what feels right for your body and mind.",
};

export default function YogaPage() {
  return (
    <AppShell quote="A strong body creates a calm mind.">
      <AsanaHero />
      <Suspense
        fallback={
          <div>
            <div className="h-11 animate-pulse rounded-full bg-primary-50" aria-hidden="true" />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
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

