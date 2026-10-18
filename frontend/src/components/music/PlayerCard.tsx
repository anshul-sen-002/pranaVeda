"use client";
import Link from "next/link";
import { Heart, Moon, Pause, Play } from "lucide-react";
import { useState } from "react";
import { CoverImage } from "@/components/media/CoverImage";
import { usePlayer } from "@/components/music/PlayerProvider";
import { useAuth } from "@/hooks/useAuth";
import { audioApi } from "@/lib/api/audio";
import { cn } from "@/lib/cn";

function clock(s: number) {
  const v = Math.max(0, Math.floor(s));
  return `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
}
const SLEEPS = [5, 10, 15, 30, 60];

/** Now-playing card with seek, sleep timer, favourite + history hooks. */
export function PlayerCard() {
  const { current, playing, toggle, elapsed, duration, loading, error, seek, sleepMins, setSleep } = usePlayer();
  const { status, accessToken } = useAuth();
  const [fav, setFav] = useState(false);
  if (!current) {
    return (
      <section aria-label="Now playing" className="rounded-3xl border border-border-soft bg-surface p-5">
        <h2 className="text-sm font-semibold text-heading">Now Playing</h2>
        <p className="mt-2 text-sm text-muted">Press play on any track to begin.</p>
      </section>
    );
  }
  const pct = duration ? Math.min(100, (elapsed / duration) * 100) : 0;
  const toggleFav = async () => {
    if (status !== "authenticated" || !accessToken) {
      window.location.href = `/login?next=${encodeURIComponent("/calm-music")}`;
      return;
    }
    try {
      const s = await audioApi.toggleFavorite(current.id, accessToken);
      setFav(s.favorite);
    } catch { /* noop */ }
  };
  const listened = async () => {
    if (status === "authenticated" && accessToken) {
      try { await audioApi.recordListen(current.id, elapsed, accessToken); } catch { /* noop */ }
    }
  };
  return (
    <section aria-label="Now playing" className="rounded-3xl border border-border-soft bg-surface p-5">
      <h2 className="text-sm font-semibold text-heading">Now Playing</h2>
      <Link href={`/calm-music/${current.slug}`} className="mt-3 flex items-center gap-3">
        <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-primary-50"><CoverImage src={current.coverImageUrl} alt="" /></span>
        <span className="min-w-0"><span className="block truncate text-sm font-semibold text-heading hover:text-primary-700">{current.title}</span>
        <span className="text-xs text-muted tabular-nums">{clock(elapsed)}{duration ? ` / ${clock(duration)}` : ""}</span></span>
      </Link>
      <button type="button" onClick={() => seek(elapsed - 10)} aria-label="Back 10 seconds" className="sr-only">Back</button>
      <div className="mt-3">
        <input type="range" min={0} max={Math.max(1, duration ?? 1)} step={1} value={Math.min(elapsed, duration ?? elapsed)} onChange={(e) => seek(Number(e.target.value))} aria-label="Seek" className="w-full accent-primary-600" />
        <div className="mt-1 flex justify-between text-[11px] text-muted tabular-nums"><span>{clock(elapsed)}</span><span>{duration ? clock(duration) : "—"}</span></div>
      </div>
      {error ? <p className="mt-2 rounded-xl bg-danger/5 px-3 py-2 text-xs text-danger" role="alert">{error}</p> : null}
      <div className="mt-2 flex items-center justify-center gap-2">
        <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="inline-flex size-13 items-center justify-center rounded-full bg-primary-600 p-3.5 text-white hover:bg-primary-700">
          {playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}
        </button>
        <button type="button" onClick={() => void toggleFav()} aria-pressed={fav} aria-label="Favourite track" className={cn("inline-flex size-10 items-center justify-center rounded-full", fav ? "bg-primary-100 text-primary-700" : "bg-primary-50 text-primary-700")}>
          <Heart className={cn("size-4", fav && "fill-current")} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => void listened()} className="inline-flex h-10 items-center rounded-full bg-primary-50 px-3 text-xs font-medium text-primary-700">Log listen</button>
      </div>
      {loading ? <p className="mt-2 text-center text-xs text-muted">Loading audio…</p> : null}
      <div className="mt-4 border-t border-border-soft pt-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-heading"><Moon className="size-3.5 text-primary-600" aria-hidden="true" />Sleep timer{sleepMins ? ` · ${sleepMins} min` : ""}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SLEEPS.map((m) => (
            <button key={m} type="button" onClick={() => setSleep(sleepMins === m ? null : m)} aria-pressed={sleepMins === m} className={cn("min-h-8 rounded-full px-3 text-xs font-medium", sleepMins === m ? "bg-primary-600 text-white" : "bg-surface-tint text-body")}>{m}m</button>
          ))}
          {sleepMins ? <button type="button" onClick={() => setSleep(null)} className="min-h-8 rounded-full px-3 text-xs text-muted">Off</button> : null}
        </div>
      </div>
    </section>
  );
}
