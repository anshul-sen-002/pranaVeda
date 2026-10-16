import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LibraryView } from "@/components/library/LibraryView";
import { LeafSprig } from "@/components/brand/Botanical";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ContentCardSkeleton } from "@/components/library/ContentCardSkeleton";

export const metadata: Metadata = {
  title: "Yoga Poses | PranaVeda",
  description: "Explore poses for every level and goal. Find what feels right for your body and mind.",
};

export default function YogaPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden border-b border-border-soft bg-gradient-to-br from-surface via-primary-50 to-surface-tint-2">
          <LeafSprig className="pointer-events-none absolute top-2 left-6 hidden h-32 w-24 text-primary-300 sm:block" />
          <LeafSprig flip className="pointer-events-none absolute right-6 bottom-2 hidden h-32 w-24 text-primary-200 sm:block" />
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary-600 uppercase">Yoga library</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">Yoga Poses</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-body sm:text-base">Explore poses for every level and goal. Find what feels right for your body and mind.</p>
          </div>
        </section>
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <Suspense
            fallback={
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
                {Array.from({ length: 6 }).map((_, i) => <ContentCardSkeleton key={i} />)}
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
