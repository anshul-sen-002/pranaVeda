"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Headphones } from "lucide-react";

import { audioApi } from "@/lib/api/audio";
import type { AudioTrackSummary } from "@/lib/api/types";
import { CATEGORY_LABEL, minutesOf } from "@/components/music/trackMeta";
import { CATEGORY_CHIP } from "@/components/music/useTracks";
import { CoverImage } from "@/components/media/CoverImage";
import { LinkButton } from "@/components/ui/LinkButton";
import { cn } from "@/lib/cn";

/**
 * Live calm-music strip on the home page. Pulls the newest published tracks
 * and links each card to its detail page (no inline player here — the marketing
 * page has no AudioPlayerProvider, and a stray player would risk duplicate
 * audio against the /calm-music mini-player).
 */
export function HomeCalmMusic() {
  const [tracks, setTracks] = useState<AudioTrackSummary[] | null>(null);

  useEffect(() => {
    let live = true;
    audioApi
      .list(0, 4)
      .then((page) => {
        if (live) setTracks(page.content.slice(0, 4));
      })
      .catch(() => {
        if (live) setTracks([]);
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8" aria-label="Calm music and audio">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-heading">Calm Music &amp; Audio</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
            Soothe your mind, one breath at a time
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body">
            Meditation music, rain and nature ambience, singing bowls and sleep soundscapes —
            stream them free, no sign-in needed.
          </p>
        </div>
        <Link
          href="/calm-music"
          className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary-700 underline-offset-4 hover:underline sm:inline-flex"
        >
          View all <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tracks === null
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-border-soft bg-surface"
                aria-hidden="true"
              />
            ))
          : null}
        {tracks !== null && tracks.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-border-soft bg-surface p-6 text-sm text-muted">
            Calming tracks are on their way —{" "}
            <Link href="/calm-music" className="text-primary-700 underline">
              open the library
            </Link>
            .
          </p>
        ) : null}
        {tracks?.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: i * 0.05 }}
          >
            <Link
              href={`/calm-music/${t.slug}`}
              className="group block overflow-hidden rounded-2xl border border-border-soft bg-surface transition-shadow hover:shadow-[0_14px_36px_-24px_rgba(29,111,84,0.5)]"
            >
              <div className="relative aspect-[16/10] w-full bg-primary-50">
                <CoverImage src={t.coverImageUrl} alt="" className="h-full w-full object-cover" />
                <span
                  className={cn(
                    "absolute top-2 left-2 inline-flex max-w-[70%] truncate items-center gap-1 rounded-full bg-surface/95 px-2 py-0.5 text-[11px] font-medium shadow-sm backdrop-blur sm:px-2.5 sm:py-1 sm:text-xs",
                    CATEGORY_CHIP[t.category],
                  )}
                >
                  {CATEGORY_LABEL[t.category]}
                </span>
                <span className="absolute right-2 bottom-2 inline-flex size-9 items-center justify-center rounded-full bg-surface/95 text-primary-700 shadow-sm">
                  <Headphones className="size-4" aria-hidden="true" />
                </span>
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="line-clamp-1 text-sm font-semibold text-heading sm:text-base">
                  {t.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                  {t.description ?? ""}
                </p>
                <p className="mt-2 text-[11px] text-muted tabular-nums sm:text-xs">
                  {minutesOf(t)}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 sm:hidden">
        <LinkButton href="/calm-music" size="sm" fullWidth>
          Explore all sounds
        </LinkButton>
      </div>
      <p className="mt-4 text-xs text-muted">
        Public tracks stream free ·{" "}
        <Link href="/login" className="font-medium text-primary-700 underline-offset-4 hover:underline">
          Sign in
        </Link>{" "}
        to favorite tracks and keep your listening history.
      </p>
    </section>
  );
}
