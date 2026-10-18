"use client";

import { useMemo } from "react";
import { EllipsisVertical, Pause, Play, Search, X } from "lucide-react";

import { CoverImage } from "@/components/media/CoverImage";
import type { AudioCategory, AudioTrackSummary } from "@/lib/api/types";
import { cn } from "@/lib/cn";

interface GridProps {
  tracks: AudioTrackSummary[];
  filter: AudioCategory | "ALL";
  onFilter: (f: AudioCategory | "ALL") => void;
  filters: { value: AudioCategory | "ALL"; label: string }[];
  query: string;
  onQuery: (q: string) => void;
  debounced: string;
  loading: boolean;
  error: string | null;
  currentId: number | null;
  playing: boolean;
  onToggle: (t: AudioTrackSummary) => void;
  categoryChip: Record<AudioCategory, string>;
  categoryLabel: Record<AudioCategory, string>;
  minutesOf: (t: AudioTrackSummary) => string;
}

/** Filter chips + search + track cards (backend covers, shared fallback). */
export function TrackGrid({
  tracks, filter, onFilter, filters, query, onQuery, debounced,
  loading, error, currentId, playing, onToggle,
  categoryChip, categoryLabel, minutesOf,
}: GridProps) {
  const visible = useMemo(
    () =>
      tracks.filter(
        (t) =>
          !debounced ||
          t.title.toLowerCase().includes(debounced) ||
          (t.description ?? "").toLowerCase().includes(debounced),
      ),
    [tracks, debounced],
  );

  return (
    <>
      <div className="mt-3 flex flex-col gap-2.5 sm:mt-4 sm:flex-row sm:items-center lg:gap-3">
        <div className="scrollbar-none -mx-0.5 flex flex-1 items-center gap-1.5 overflow-x-auto px-0.5 py-0.5 sm:gap-2" role="group" aria-label="Filter tracks">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onFilter(f.value)}
              aria-pressed={filter === f.value}
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors",
                filter === f.value ? "bg-primary-600 text-white" : "bg-surface text-body hover:bg-primary-50 hover:text-primary-700",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-56 sm:shrink-0 lg:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search music…"
            aria-label="Search music"
            className="h-11 w-full rounded-full border border-border-soft bg-surface pr-4 pl-10 text-sm text-heading placeholder:text-muted focus:border-primary-300 focus:ring-2 focus:ring-primary-200 focus:outline-none"
          />
        </div>
      </div>
      <TrackResults
        debounced={debounced}
        loading={loading}
        error={error}
        query={query}
        onQuery={onQuery}
        visible={visible}
        currentId={currentId}
        playing={playing}
        onToggle={onToggle}
        categoryChip={categoryChip}
        categoryLabel={categoryLabel}
        minutesOf={minutesOf}
      />
    </>
  );
}

function TrackResults({
  debounced, loading, error, query, onQuery, visible,
  currentId, playing, onToggle, categoryChip, categoryLabel, minutesOf,
}: {
  debounced: string;
  loading: boolean;
  error: string | null;
  query: string;
  onQuery: (q: string) => void;
  visible: AudioTrackSummary[];
  currentId: number | null;
  playing: boolean;
  onToggle: (t: AudioTrackSummary) => void;
  categoryChip: Record<AudioCategory, string>;
  categoryLabel: Record<AudioCategory, string>;
  minutesOf: (t: AudioTrackSummary) => string;
}) {
  void debounced;
  if (error) {
    return (
      <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/5 px-6 py-8 text-center" role="alert">
        <p className="font-medium text-heading">Could not load music</p>
        <p className="mt-1 text-sm text-muted">{error}</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="mt-4 grid gap-4 sm:grid-cols-2" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-surface" />
        ))}
      </div>
    );
  }
  if (visible.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-border-soft bg-surface px-6 py-12 text-center">
        <p className="font-medium text-heading">No tracks yet</p>
        <p className="mt-1 text-sm text-muted">Publish a track from the admin studio and it will appear here with its cover.</p>
        {query ? (
          <button
            type="button"
            onClick={() => onQuery("")}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
          >
            <X className="size-4" aria-hidden="true" />
            Clear search
          </button>
        ) : null}
      </div>
    );
  }
  return (
    <div className="mt-3 grid gap-2.5 sm:mt-4 sm:gap-4 sm:grid-cols-2" role="list" aria-label="Tracks">
      {visible.map((t) => {
        const active = currentId === t.id && playing;
        return (
          <article key={t.id} role="listitem" className="mobile-compact flex gap-2.5 rounded-2xl border border-border-soft bg-surface p-2.5 transition-shadow hover:shadow-[0_14px_36px_-24px_rgba(23,137,199,0.5)] sm:gap-3.5 sm:p-3.5">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-primary-50 sm:size-24">
              <CoverImage src={t.coverImageUrl} alt="" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className={cn("w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:text-[11px]", categoryChip[t.category])}>
                {categoryLabel[t.category]}
              </span>
              <h3 className="mt-1 truncate text-[13px] font-semibold text-heading sm:mt-1.5 sm:text-sm">{t.title}</h3>
              <p className="text-[11px] text-muted sm:text-xs">♪ {minutesOf(t)}</p>
              <p className="mt-0.5 line-clamp-1 text-[11px] leading-relaxed text-muted sm:line-clamp-2 sm:text-xs">{t.description}</p>
            </div>
            <div className="flex shrink-0 flex-col items-center justify-between py-0.5">
              <button type="button" aria-label={`More options for ${t.title}`} className="hidden size-8 items-center justify-center rounded-full text-muted hover:bg-primary-50 hover:text-primary-700 sm:inline-flex">
                <EllipsisVertical className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onToggle(t)}
                aria-label={active ? `Pause ${t.title}` : `Play ${t.title}`}
                className="inline-flex size-11 items-center justify-center rounded-full border border-primary-200 text-primary-600 transition-colors hover:bg-primary-600 hover:text-white sm:size-10"
              >
                {active ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
