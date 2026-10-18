"use client";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { usePlayer } from "@/components/music/PlayerProvider";
import { CoverImage } from "@/components/media/CoverImage";

function clock(s: number) {
  const v = Math.max(0, Math.floor(s));
  return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
}

/** Persistent mini-player — floats above the bottom tab bar on phones. */
export function MiniPlayer() {
  const { current, playing, toggle, elapsed, duration } = usePlayer();
  if (!current) return null;
  const pct = duration ? Math.min(100, (elapsed / duration) * 100) : 0;
  return (
    <div className="safe-area-bottom fixed inset-x-2 bottom-[4.5rem] z-40 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96 lg:bottom-6">
      <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface/95 shadow-[0_20px_50px_-20px_rgba(23,137,199,0.5)] backdrop-blur">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Link href={`/calm-music/${current.slug}`} className="size-11 shrink-0 overflow-hidden rounded-xl bg-primary-50" aria-label={`Open ${current.title}`}>
            <CoverImage src={current.coverImageUrl} alt="" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-heading">{current.title}</p>
            <p className="text-[11px] text-muted tabular-nums">{clock(elapsed)}{duration ? ` / ${clock(duration)}` : ""}</p>
          </div>
          <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="inline-flex size-10 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700">
            {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
          </button>
        </div>
        <div className="h-1 bg-primary-100" aria-hidden="true"><div className="h-full bg-primary-500" style={{ width: `${pct}%` }} /></div>
      </div>
    </div>
  );
}
