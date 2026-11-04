"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownWideNarrow, Music2, Play, Search, X } from "lucide-react";

import { CATEGORY_CHIP, CATEGORY_LABEL, FILTERS, minutesOf, useTracks } from "@/components/music/useTracks";
import { NowPlayingRail } from "@/components/music/NowPlayingRail";
import { TrackCard } from "@/components/music/TrackCard";
import { usePlayer } from "@/components/music/PlayerProvider";
import { cn } from "@/lib/cn";
import type { AudioCategory } from "@/lib/api/types";

export function MusicView() {
  const [filter, setFilter] = useState<AudioCategory | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [sort, setSort] = useState<"newest" | "title" | "shortest">("newest");
  const { tracks, loading, error } = useTracks(filter);
  const { current, playing, elapsed, duration, play, toggle, next, prev, seek } = usePlayer();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const visible = useMemo(() => {
    const matching = tracks.filter((t) => !debounced || t.title.toLowerCase().includes(debounced) || (t.description ?? "").toLowerCase().includes(debounced));
    return [...matching].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "shortest") return (a.durationSeconds ?? Number.MAX_SAFE_INTEGER) - (b.durationSeconds ?? Number.MAX_SAFE_INTEGER);
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime() || b.id - a.id;
    });
  }, [tracks, debounced, sort]);
  const totalMins = tracks.reduce((sum, track) => sum + Math.round((track.durationSeconds ?? 0) / 60), 0);
  const totalLabel = totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins} min`;

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_19rem] 2xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-5">
          <header className="flex items-center gap-3 px-1 sm:gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 sm:size-16"><Music2 className="size-7 sm:size-8" aria-hidden="true" /></span>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">Calm Music</h1>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-body">Relax your mind, balance your energy, and find inner peace with our curated collection of calming music.</p>
            </div>
          </header>

          <section className="relative isolate min-h-[245px] overflow-hidden rounded-2xl border border-[#e5ebe1] bg-[#eaf1e8] sm:min-h-[270px] sm:rounded-3xl" aria-label="Featured playlist">
            <div className="absolute inset-0 -z-10 bg-[url('/yoga.png')] bg-cover bg-[center_55%]" aria-hidden="true" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#edf4ed]/95 via-[#edf4ed]/80 to-[#edf4ed]/10" aria-hidden="true" />
            <div className="flex min-h-[245px] flex-col items-start justify-center p-5 sm:min-h-[270px] sm:p-8">
              <span className="rounded-full border border-emerald-300/80 bg-emerald-100/75 px-3 py-1 text-[11px] font-semibold tracking-wide text-primary-800 uppercase">Featured playlist</span>
              <h2 className="mt-3 max-w-lg text-2xl font-semibold tracking-tight text-heading sm:text-3xl">Peaceful Mind, Better You</h2>
              <p className="mt-1 max-w-md text-sm text-body">Soothing sounds for a calmer, happier you.</p>
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button type="button" onClick={() => visible[0] && play(visible[0], visible)} disabled={!visible.length || loading} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-800 disabled:opacity-50">
                  <Play className="size-4 fill-current" aria-hidden="true" /> Play playlist
                </button>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/75 px-3.5 py-2 text-xs font-medium text-body backdrop-blur">
                  <Music2 className="size-4 text-primary-700" aria-hidden="true" />{loading ? "Loading…" : `${tracks.length} ${tracks.length === 1 ? "track" : "tracks"} · ${totalLabel}`}
                </span>
              </div>
            </div>
          </section>
        </div>
        <NowPlayingRail current={current} playing={playing} elapsed={elapsed} duration={duration} onToggle={toggle} onNext={next} onPrevious={prev} onSeek={seek} minutesOf={minutesOf} />
      </div>

      <section className="min-w-0 rounded-2xl border border-[#e4e9e2] bg-white/85 p-3 shadow-[0_12px_35px_-30px_rgba(29,63,46,.32)] sm:rounded-3xl sm:p-4" aria-label="Music library">
        <div className="scrollbar-none -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-0.5 sm:flex-wrap sm:gap-2 sm:px-0" role="group" aria-label="Filter tracks">
          {FILTERS.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} aria-pressed={filter === item.value} className={cn("min-h-9 shrink-0 rounded-full border px-3.5 text-xs font-medium transition-colors sm:min-h-10 sm:px-4 sm:text-[13px]", filter === item.value ? "border-primary-700 bg-primary-700 text-white shadow-sm" : "border-border-soft bg-white text-body hover:border-primary-200 hover:text-primary-700")}>{item.label}</button>)}
        </div>
        <div className="mt-3 flex min-w-0 flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search music..." aria-label="Search music" className="h-10 w-full rounded-full border border-[#e6eadd] bg-[#fbfcf8] pr-4 pl-10 text-sm text-heading placeholder:text-muted focus:border-primary-300 focus:ring-2 focus:ring-primary-100 focus:outline-none sm:h-11" />
          </div>
          <label className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#e6eadd] bg-white px-3 text-sm text-body sm:h-11">
            <ArrowDownWideNarrow className="size-4 text-primary-700" aria-hidden="true" />
            <span className="sr-only">Sort tracks</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="min-w-0 flex-1 bg-transparent text-sm outline-none sm:flex-none">
              <option value="newest">Newest first</option><option value="title">Title A–Z</option><option value="shortest">Shortest first</option>
            </select>
          </label>
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/5 px-5 py-8 text-center" role="alert"><p className="font-medium text-heading">Could not load music</p><p className="mt-1 text-sm text-muted">{error}</p></div> : null}
        {loading ? <div className="mt-4 space-y-2" aria-hidden="true">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-[76px] animate-pulse rounded-xl bg-surface" />)}</div> : visible.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-border-soft bg-surface px-6 py-12 text-center sm:py-16">
            <p className="font-medium text-heading">{query ? "No tracks match your search" : "No tracks yet"}</p><p className="mt-1 text-sm text-muted">{query ? "Try a different keyword or clear your search." : "Published music will appear here."}</p>
            {query ? <button type="button" onClick={() => setQuery("")} className="mt-4 inline-flex items-center gap-1 rounded-full border border-border-soft px-4 py-2 text-sm font-medium text-primary-700 hover:border-primary-300 hover:bg-primary-50"><X className="size-4" aria-hidden="true" /> Clear search</button> : null}
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-[#e9ede7] px-3 sm:px-4" role="list" aria-label="Tracks">
            {visible.map((track) => <TrackCard key={track.id} track={track} active={current?.id === track.id && playing} onToggle={() => current?.id === track.id && playing ? toggle() : play(track, visible)} categoryChip={CATEGORY_CHIP} categoryLabel={CATEGORY_LABEL} minutesOf={minutesOf} />)}
          </div>
        )}
      </section>
    </div>
  );
}
