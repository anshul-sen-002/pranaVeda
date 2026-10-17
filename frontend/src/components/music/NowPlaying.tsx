"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";

import { CoverImage } from "@/components/media/CoverImage";
import type { AudioCategory, AudioTrackSummary } from "@/lib/api/types";

/** Right-rail Now Playing card with a simulated progress bar. */
export function NowPlaying({
  track, playing, onToggle, minutesOf, categoryLabel,
}: {
  track: AudioTrackSummary | null;
  playing: boolean;
  onToggle: () => void;
  minutesOf: (t: AudioTrackSummary) => string;
  categoryLabel: Record<AudioCategory, string>;
}) {
  const [elapsed, setElapsed] = useState(272);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => setElapsed((e) => (e >= 720 ? 0 : e + 1)), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing]);

  useEffect(() => setElapsed(0), [track?.id]);
  const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <section aria-label="Now playing" className="rounded-3xl border border-border-soft bg-surface p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-heading">
        <span className="flex items-end gap-0.5 text-primary-600" aria-hidden="true">
          <span className="w-0.5 animate-pulse rounded bg-current" style={{ height: 14 }} />
          <span className="w-0.5 rounded bg-current" style={{ height: 9 }} />
          <span className="w-0.5 animate-pulse rounded bg-current" style={{ height: 12 }} />
        </span>
        Now Playing
      </h2>
      {track ? (
        <div className="mt-3 flex items-center gap-3">
          <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-primary-50">
            <CoverImage src={track.coverImageUrl} alt="" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-heading">{track.title}</p>
            <p className="text-xs text-muted">{categoryLabel[track.category]} · {minutesOf(track)}</p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">Nothing queued yet.</p>
      )}
      <div className="mt-3" aria-hidden="true">
        <div className="h-1 overflow-hidden rounded-full bg-primary-100">
          <div className="h-full rounded-full bg-primary-500 transition-[width]" style={{ width: `${Math.min(100, (elapsed / 720) * 100)}%` }} />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-muted">
          <span>{clock(elapsed)}</span>
          <span>{track ? minutesOf(track).replace(" min", ":00") : "00:00"}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <PanelBtn label="Shuffle" Icon={Shuffle} />
        <PanelBtn label="Previous" Icon={SkipBack} />
        <button
          type="button"
          onClick={onToggle}
          aria-label={playing ? "Pause" : "Play"}
          className="inline-flex size-13 items-center justify-center rounded-full bg-primary-600 p-3.5 text-white transition-colors hover:bg-primary-700"
        >
          {playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}
        </button>
        <PanelBtn label="Next" Icon={SkipForward} />
        <PanelBtn label="Repeat" Icon={Repeat} />
      </div>
    </section>
  );
}

export function PanelBtn({ label, Icon }: { label: string; Icon: typeof Play }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-colors hover:bg-primary-100"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
