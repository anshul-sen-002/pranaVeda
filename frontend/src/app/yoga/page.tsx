import { Suspense } from "react";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LibraryView } from "@/components/library/LibraryView";
import { ContentCardSkeleton } from "@/components/library/ContentCardSkeleton";

export const metadata: Metadata = {
  title: "Yoga Poses | PranaVeda",
  description: "Explore poses for every level and goal. Find what feels right for your body and mind.",
};

export default function YogaPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-8 sm:px-8">
        <section aria-labelledby="yoga-poses-heading">
          <h1 id="yoga-poses-heading" className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
            Yoga Poses
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-body">
            Explore poses for every level and goal. Find what feels right for
            your body and mind.
          </p>
        </section>

        <div className="mt-7 flex-1">
          <Suspense
            fallback={
              <div>
                <div className="h-11 animate-pulse rounded-full bg-primary-50" aria-hidden="true" />
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ContentCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            }
          >
            <LibraryView />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

