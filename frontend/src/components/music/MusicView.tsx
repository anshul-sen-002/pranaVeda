"use client";

import { useEffect, useState } from "react";
import { Music2 } from "lucide-react";

import { CATEGORY_CHIP, CATEGORY_LABEL, FILTERS, minutesOf, useTracks } from "@/components/music/useTracks";
import { TrackGrid } from "@/components/music/TrackGrid";
import { NowPlaying } from "@/components/music/NowPlaying";
import { Playlist } from "@/components/music/Playlist";
import type { AudioCategory } from "@/lib/api/types";
import { cn } from "@/lib/cn";

/** Calm Music library matching screenshot 1, wired to the live audio API. */
export function MusicView() {
  const [filter, setFilter] = useState<AudioCategory | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const { tracks, byId, loading, error } = useTracks(filter);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [queue, setQueue] = useState<number[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setQueue((q) => (q.length === 0 ? tracks.map((t) => t.id) : q));
    setCurrentId((id) => id ?? tracks[0]?.id ?? null);
  }, [tracks]);

  const playTrack = (id: number) => {
    setCurrentId(id);
    setPlaying(true);
    setQueue((q) => (q.includes(id) ? q : [...q, id]));
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <header className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
            <Music2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-heading sm:text-2xl">Calm Music</h1>
            <p className="mt-0.5 max-w-md text-sm leading-relaxed text-body">
              Relax your mind, balance your energy, and find inner peace with our curated collection of calming music.
            </p>
          </div>
        </header>

        <section aria-label="Featured playlist" className="relative mt-4 overflow-hidden rounded-3xl border border-border-soft bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/hero-calm.svg" alt="" aria-hidden="true" className="h-52 w-full object-cover sm:h-60" />
          <div className="absolute inset-0 flex flex-col justify-center gap-1.5 bg-gradient-to-r from-primary-50/95 via-primary-50/55 to-transparent px-6 sm:px-8">
            <p className="text-[11px] font-semibold tracking-widest text-primary-700 uppercase">Featured Playlist</p>
            <h2 className="text-xl font-semibold tracking-tight text-heading sm:text-2xl">Peaceful Mind, Better You</h2>
            <p className="text-sm text-body">Soothing sounds for a calmer, happier you.</p>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => tracks[0] && playTrack(tracks[0].id)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Play All
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3.5 py-2 text-xs font-medium text-body backdrop-blur">
                {loading ? "…" : `${tracks.length} tracks`}
              </span>
            </div>
          </div>
        </section>

        <TrackGrid
          tracks={tracks}
          filter={filter}
          onFilter={setFilter}
          filters={FILTERS}
          query={query}
          onQuery={setQuery}
          debounced={debounced}
          loading={loading}
          error={error}
          currentId={currentId}
          playing={playing}
          onToggle={(t) => (currentId === t.id && playing ? setPlaying(false) : playTrack(t.id))}
          categoryChip={CATEGORY_CHIP}
          categoryLabel={CATEGORY_LABEL}
          minutesOf={minutesOf}
        />
      </div>

      <div className="min-w-0 space-y-5">
        <NowPlaying
          track={currentId != null ? (byId.get(currentId) ?? null) : null}
          playing={playing}
          onToggle={() => setPlaying((p) => !p)}
          minutesOf={minutesOf}
          categoryLabel={CATEGORY_LABEL}
        />
        <Playlist
          ids={queue}
          byId={byId}
          currentId={currentId}
          playing={playing}
          onSelect={playTrack}
          onClear={() => setQueue([])}
          minutesOf={minutesOf}
        />
      </div>
    </div>
  );
}

// Re-exported so TrackGrid stays tiny.
export { cn };
