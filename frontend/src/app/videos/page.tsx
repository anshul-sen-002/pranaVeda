import { Suspense } from "react";
import type { Metadata } from "next";
import { Play } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { LibraryView } from "@/components/library/LibraryView";
import { ContentCardSkeleton } from "@/components/library/ContentCardSkeleton";

export const metadata: Metadata = {
  title: "Yoga Videos | PranaVeda",
  description: "Guided practice videos you can follow along with, at any level — no sign-in needed to watch.",
};

/**
 * Public "Yoga Videos" listing (agents.md 2.4: published yoga videos are
 * watchable without an account). Reuses the exact yoga-library UI via
 * <LibraryView fixedType="VIDEO" /> — search, sort, filters, cards and
 * pagination all behave the same, the listing is simply pinned to
 * VIDEO-type content.
 */
export default function YogaVideosPage() {
  return (
    <AppShell quote="Flow with your breath, one video at a time.">
      <section className="mb-6 flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
          <Play className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
            Yoga Videos
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-body sm:text-base">
            Guided practice videos you can follow along with. Stream freely — no
            sign-in needed. Save a video to your library once you sign in.
          </p>
        </div>
      </section>
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
        <LibraryView fixedType="VIDEO" />
      </Suspense>
    </AppShell>
  );
}