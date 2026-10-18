"use client";
import { useEffect, useState } from "react";
import { Music2 } from "lucide-react";
import { CATEGORY_CHIP, CATEGORY_LABEL, FILTERS, minutesOf, useTracks } from "@/components/music/useTracks";
import { TrackGrid } from "@/components/music/TrackGrid";
import { PlayerCard } from "@/components/music/PlayerCard";
import { usePlayer } from "@/components/music/PlayerProvider";
import type { AudioCategory } from "@/lib/api/types";

/** Calm Music library wired to the live audio API + global player. */
export function MusicView() {
  const [filter, setFilter] = useState<AudioCategory | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const { tracks, loading, error } = useTracks(filter);
  const { current, playing, play, toggle } = usePlayer();
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <header className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700"><Music2 className="size-5" aria-hidden="true" /></span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-heading sm:text-2xl">Calm Music</h1>
            <p className="mt-0.5 max-w-md text-sm leading-relaxed text-body">Relax your mind with curated meditation, sleep, focus, and nature sounds.</p>
          </div>
        </header>
        <section aria-label="Featured playlist" className="relative mt-3 overflow-hidden rounded-2xl border border-border-soft bg-surface sm:mt-4 sm:rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/hero-calm.svg" alt="" aria-hidden="true" className="h-44 w-full object-cover sm:h-60" />
          <div className="absolute inset-0 flex flex-col justify-center gap-1 bg-gradient-to-r from-primary-50/95 via-primary-50/55 to-transparent px-4 sm:gap-1.5 sm:px-8">
            <p className="text-[10px] font-semibold tracking-widest text-primary-700 uppercase sm:text-[11px]">Featured Playlist</p>
            <h2 className="text-lg font-semibold tracking-tight text-heading sm:text-2xl">Peaceful Mind, Better You</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:mt-2 sm:gap-2.5">
              <button type="button" onClick={() => tracks[0] && play(tracks[0], tracks)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700">Play All</button>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1.5 text-[11px] font-medium text-body backdrop-blur sm:px-3.5 sm:py-2 sm:text-xs">{loading ? "…" : `${tracks.length} tracks`}</span>
            </div>
          </div>
        </section>
        <TrackGrid tracks={tracks} filter={filter} onFilter={setFilter} filters={FILTERS} query={query} onQuery={setQuery} debounced={debounced} loading={loading} error={error} currentId={current?.id ?? null} playing={playing} onToggle={(t) => (current?.id === t.id && playing ? toggle() : play(t, tracks))} categoryChip={CATEGORY_CHIP} categoryLabel={CATEGORY_LABEL} minutesOf={minutesOf} />
      </div>
      <div className="min-w-0"><PlayerCard /></div>
    </div>
  );
}
