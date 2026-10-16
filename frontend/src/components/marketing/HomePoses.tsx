"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { listContent } from "@/lib/api/content";
import type { ContentSummary } from "@/lib/api/types";
import { ContentCard } from "@/components/library/ContentCard";
import { ContentCardSkeleton } from "@/components/library/ContentCardSkeleton";

/** Homepage pose strip — mockup 1 section 2, live data, max 4 cards. */
export function HomePoses() {
  const [items, setItems] = useState<ContentSummary[] | null>(null);
  useEffect(() => {
    let live = true;
    listContent({ sort: "newest", page: 0, size: 4 }).then((p) => { if (live) setItems(p.content.slice(0, 4)); }).catch(() => { if (live) setItems([]); });
    return () => { live = false; };
  }, []);
  return (
    <section className="mx-auto max-w-6xl px-5 pt-4 pb-2 sm:px-8" aria-label="Explore yoga poses">
      <div className="flex items-end justify-between gap-4">
        <div><h2 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">Explore Yoga Poses</h2>
        <p className="mt-2 text-sm leading-relaxed text-body">Discover a variety of poses for every level — from beginner to advanced.</p></div>
        <Link href="/yoga" className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary-700 underline-offset-4 hover:underline sm:inline-flex">View all poses <ArrowRight className="size-4" aria-hidden="true" /></Link>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items === null ? Array.from({ length: 4 }).map((_, i) => <ContentCardSkeleton key={i} />) : null}
        {items !== null && items.length === 0 ? <p className="col-span-full rounded-2xl border border-border-soft bg-surface p-6 text-sm text-muted">Poses are on their way — <Link href="/yoga" className="text-primary-700 underline">open the library</Link>.</p> : null}
        {items?.map((it) => <ContentCard key={it.id} item={it} />)}
      </div>
      <Link href="/yoga" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary-700 underline-offset-4 hover:underline sm:hidden">View all poses <ArrowRight className="size-4" aria-hidden="true" /></Link>
    </section>
  );
}
