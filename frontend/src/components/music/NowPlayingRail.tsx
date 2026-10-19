"use client";

import { EllipsisVertical, ListMusic, Pause, Play } from "lucide-react";

import { CoverImage } from "@/components/media/CoverImage";
import type { AudioTrackSummary } from "@/lib/api/types";
import { cn } from "@/lib/cn";

function clock(s: number) {
  const v = Math.max(0, Math.floor(s));
  return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
}

/** Screenshot right rail: Now Playing card + Your Playlist, wired to the real player. */
export function NowPlayingRail({
  queue, current, playing, elapsed, duration, onToggle, onSelect, onClear, minutesOf,
}: {
  queue: AudioTrackSummary[];
  current: AudioTrackSummary | null;
  playing: boolean;
  elapsed: number;
  duration: number | null;
  onToggle: () => void;
  onSelect: (t: AudioTrackSummary) => void;
  onClear: () => void;
  minutesOf: (t: AudioTrackSummary) => string;
}) {
  const pct = duration ? Math.min(100, (elapsed / duration) * 100) : 0;
  return (
    <div className="grid content-start gap-4">
      <section aria-label="Now playing" className="rounded-3xl border border-border-soft bg-surface p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-heading">
          <span className="flex items-end gap-0.5 text-primary-600" aria-hidden="true">
            <span className="w-0.5 animate-pulse rounded bg-current" style={{ height: 14 }} />
            <span className="w-0.5 rounded bg-current" style={{ height: 9 }} />
            <span className="w-0.5 animate-pulse rounded bg-current" style={{ height: 12 }} />
          </span>
          Now Playing
        </h2>
        {current ? (
          <div className="mt-3 flex items-center gap-3">
            <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-primary-50">
              <CoverImage src={current.coverImageUrl} alt="" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-heading">{current.title}</p>
              <p className="text-xs text-muted">{minutesOf(current)}</p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Press play on any track to begin.</p>
        )}
        <div className="mt-3" aria-hidden="true">
          <div className="h-1 overflow-hidden rounded-full bg-primary-100">
            <div className="h-full rounded-full bg-primary-500 transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted tabular-nums">
            <span>{clock(elapsed)}</span>
            <span>{duration ? clock(duration) : "—"}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <button type="button" onClick={onToggle} aria-label={playing ? "Pause" : "Play"} className="inline-flex size-13 items-center justify-center rounded-full bg-primary-600 p-3.5 text-white transition-colors hover:bg-primary-700">
            {playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5 fill-current" aria-hidden="true" />}
          </button>
        </div>
      </section>

      <section aria-label="Your playlist" className="rounded-3xl border border-border-soft bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-heading">
            <ListMusic className="size-4 text-primary-600" aria-hidden="true" />
            Your Playlist
          </h2>
          <button type="button" onClick={onClear} className="rounded-full border border-border-soft px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-primary-700">
            Clear
          </button>
        </div>
        <ul className="mt-3 space-y-1">
          {queue.length === 0 ? (
            <li className="rounded-xl px-2 py-4 text-center text-xs text-muted">Press play on any track to build your queue.</li>
          ) : (
            queue.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onSelect(t)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-primary-50",
                    current?.id === t.id && "bg-primary-50",
                  )}
                >
                  <span className="size-11 shrink-0 overflow-hidden rounded-lg bg-primary-50">
                    <CoverImage src={t.coverImageUrl} alt="" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-heading">{t.title}</span>
                    <span className="block text-xs text-muted">{minutesOf(t)}</span>
                  </span>
                  {current?.id === t.id && playing ? (
                    <Pause className="size-4 shrink-0 text-primary-600" aria-hidden="true" />
                  ) : (
                    <EllipsisVertical className="size-4 shrink-0 text-muted" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
