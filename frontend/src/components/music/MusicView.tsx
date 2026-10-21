"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Music2, Play, Search, X } from "lucide-react";

import { CATEGORY_CHIP, CATEGORY_LABEL, FILTERS, minutesOf, useTracks } from "@/components/music/useTracks";
import { NowPlayingRail } from "@/components/music/NowPlayingRail";
import { TrackCard } from "@/components/music/TrackCard";
import { usePlayer } from "@/components/music/PlayerProvider";
import { cn } from "@/lib/cn";
import type { AudioCategory } from "@/lib/api/types";

/** Calm Music library — clean, calm, mobile-first. */
export function MusicView() {
  const [filter, setFilter] = useState<AudioCategory | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const { tracks, loading, error } = useTracks(filter);
  const { current, playing, elapsed, duration, play, toggle } = usePlayer();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const visible = tracks.filter(
    (t) =>
      !debounced ||
      t.title.toLowerCase().includes(debounced) ||
      (t.description ?? "").toLowerCase().includes(debounced),
  );
  const totalMins = tracks.reduce((s, t) => s + Math.round((t.durationSeconds ?? 0) / 60), 0);
  const totalLabel = totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-6 sm:space-y-8">
      <header className="overflow-hidden rounded-3xl border border-border-soft bg-gradient-to-br from-primary-50/40 via-surface-tint to-primary-100/40 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
            <Music2 className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-heading sm:text-2xl">Calm Music</h1>
            <p className="mt-0.5 max-w-md text-sm leading-relaxed text-body">
              Relax your mind, balance your energy, and find inner peace with our curated collection of calming music.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border-soft bg-surface-tint p-5 sm:p-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-primary-600 uppercase">Featured playlist</p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-heading sm:text-2xl">Peaceful Mind, Better You</h2>
          <p className="mt-1 text-sm text-body">Soothing sounds for a calmer, happier you.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={() => visible[0] && play(visible[0], visible)} disabled={!visible.length || loading} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50">
              <Play className="size-4 fill-current" aria-hidden="true" /> Play All
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3.5 py-2 text-xs font-medium text-body backdrop-blur">
              <Music2 className="size-4 text-primary-600" aria-hidden="true" />
              {loading ? "…" : `${tracks.length} tracks · ${totalLabel}`}
            </span>
          </div>
        </div>
      </header>
      <section className="relative">
        <div className="scrollbar-none -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-0.5 sm:flex-wrap sm:gap-2 sm:px-0" role="group" aria-label="Filter tracks">
          {FILTERS.map((f) => (
            <button key={f.value} type="button" onClick={() => setFilter(f.value)} aria-pressed={filter === f.value} className={cn("min-h-9 shrink-0 rounded-full border px-3.5 text-[12px] font-medium transition-colors sm:min-h-10 sm:px-4 sm:text-[13px]", filter === f.value ? "border-primary-600 bg-primary-600 text-white shadow-sm" : "border-border-soft bg-surface text-body hover:border-primary-200 hover:text-primary-700")}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative mt-3 sm:absolute sm:top-0 sm:right-0 sm:mt-0 sm:w-56 lg:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search music..." aria-label="Search music" className="h-10 w-full rounded-full border border-border-soft bg-surface pr-4 pl-10 text-sm text-heading placeholder:text-muted focus:border-primary-300 focus:ring-2 focus:ring-primary-200 focus:outline-none sm:h-11" />
        </div>
      </section>
      <section>
        {error ? (
          <div className="mt-4 rounded-3xl border border-danger/30 bg-danger/5 px-5 py-8 text-center sm:px-8 sm:py-12" role="alert">
            <p className="font-medium text-heading">Could not load music</p>
            <p className="mt-1 text-sm text-muted">{error}</p>
          </div>
        ) : null}
        {loading ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4" aria-hidden="true">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-36 animate-pulse rounded-2xl bg-surface sm:h-44" />))}</div>
        ) : visible.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-border-soft bg-surface px-6 py-16 text-center sm:px-8 sm:py-20">
            <p className="font-medium text-heading">{query ? "No tracks match your search" : "No tracks yet"}</p>
            <p className="mt-1 text-sm text-muted">{query ? "Try a different keyword or clear your search." : "Publish tracks from the admin studio and they will appear here."}</p>
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="mt-4 inline-flex items-center gap-1 rounded-full border border-border-soft px-4 py-2 text-sm font-medium text-primary-700 hover:border-primary-300 hover:bg-primary-50"><X className="size-4" aria-hidden="true" /> Clear search</button>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4" role="list" aria-label="Tracks">{visible.map((t) => (<TrackCard key={t.id} track={t} active={current?.id === t.id && playing} onToggle={() => (current?.id === t.id && playing ? toggle() : play(t, visible))} categoryChip={CATEGORY_CHIP} categoryLabel={CATEGORY_LABEL} minutesOf={minutesOf} />))}</div>
        )}
      </section>
      </div>

      <NowPlayingRail
        current={current}
        playing={playing}
        elapsed={elapsed}
        duration={duration}
        onToggle={toggle}
        minutesOf={minutesOf}
      />
    </div>
  );
}
