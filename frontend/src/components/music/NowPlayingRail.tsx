"use client";

import { BarChart3, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import { CoverImage } from "@/components/media/CoverImage";
import type { AudioTrackSummary } from "@/lib/api/types";

function clock(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export function NowPlayingRail({
  current, playing, elapsed, duration, onToggle, onNext, onPrevious, onSeek, minutesOf,
}: {
  current: AudioTrackSummary | null;
  playing: boolean;
  elapsed: number;
  duration: number | null;
  onToggle: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  minutesOf: (track: AudioTrackSummary) => string;
}) {
  const length = duration ?? current?.durationSeconds ?? 0;
  return (
    <section aria-label="Now playing" className="min-w-0 rounded-2xl border border-[#dfe9dc] bg-gradient-gourd-white p-4 shadow-[0_12px_35px_-30px_rgba(29,63,46,.32)] sm:rounded-3xl sm:p-5 xl:sticky xl:top-24 xl:self-start">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-heading">
        <BarChart3 className="size-5 text-primary-700" aria-hidden="true" />Now Playing
      </h2>
      {current ? (
        <div className="mt-4 flex items-center gap-3">
          <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-primary-50 sm:size-24"><CoverImage src={current.coverImageUrl} alt="" className="h-full w-full object-cover" /></div>
          <div className="min-w-0"><p className="line-clamp-2 text-sm font-semibold text-heading">{current.title}</p><p className="mt-1 text-xs text-muted">{minutesOf(current)}</p></div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 sm:size-24"><BarChart3 className="size-8" aria-hidden="true" /></div>
          <div><p className="text-sm font-semibold text-heading">Nothing playing yet</p><p className="mt-1 text-xs leading-relaxed text-muted">Choose a track to begin your journey.</p></div>
        </div>
      )}
      <div className="mt-4">
        <label className="sr-only" htmlFor="music-progress">Track progress</label>
        <input id="music-progress" type="range" min={0} max={length || 1} step={1} value={Math.min(elapsed, length || elapsed)} disabled={!current || !length} onChange={(event) => onSeek(Number(event.target.value))} className="h-1.5 w-full cursor-pointer accent-primary-700 disabled:cursor-default" />
        <div className="mt-1 flex justify-between text-[11px] text-muted tabular-nums"><span>{clock(elapsed)}</span><span>{length ? clock(length) : "00:00"}</span></div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-primary-800">
        <button type="button" onClick={onPrevious} disabled={!current} aria-label="Previous track" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-primary-100 disabled:opacity-40"><ChevronLeft className="size-5" aria-hidden="true" /></button>
        <button type="button" onClick={onToggle} disabled={!current} aria-label={playing ? "Pause" : "Play"} className="inline-flex size-13 items-center justify-center rounded-full bg-primary-700 text-white transition-colors hover:bg-primary-800 disabled:opacity-50">
          {playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />}
        </button>
        <button type="button" onClick={onNext} disabled={!current} aria-label="Next track" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-primary-100 disabled:opacity-40"><ChevronRight className="size-5" aria-hidden="true" /></button>
      </div>
    </section>
  );
}
