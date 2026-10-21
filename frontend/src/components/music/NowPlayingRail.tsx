"use client";

import { Pause, Play } from "lucide-react";

import { CoverImage } from "@/components/media/CoverImage";
import type { AudioTrackSummary } from "@/lib/api/types";
import { cn } from "@/lib/cn";

function clock(s: number) {
  const v = Math.max(0, Math.floor(s));
  return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
}

/** Now Playing card wired to the real player. */
export function NowPlayingRail({
  current, playing, elapsed, duration, onToggle, minutesOf,
}: {
  current: AudioTrackSummary | null;
  playing: boolean;
  elapsed: number;
  duration: number | null;
  onToggle: () => void;
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

    </div>
  );
}
