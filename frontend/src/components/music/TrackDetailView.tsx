"use client";
import Link from "next/link";
import { ArrowLeft, Download, Heart, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { CoverImage } from "@/components/media/CoverImage";
import { usePlayer } from "@/components/music/PlayerProvider";
import { CATEGORY_LABEL, minutesOf } from "@/components/music/trackMeta";
import { useAuth } from "@/hooks/useAuth";
import { audioApi } from "@/lib/api/audio";
import { ApiError } from "@/lib/api/client";
import type { AudioDetailDto } from "@/lib/api/types";
import { cn } from "@/lib/cn";

export function TrackDetailView({ track }: { track: AudioDetailDto }) {
  const { play, playing, current } = usePlayer();
  const { status, accessToken } = useAuth();
  const [fav, setFav] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const active = current?.id === track.id && playing;

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) return;
    audioApi.favoriteStatus(track.id, accessToken).then(
      (s) => setFav(s.favorite),
      () => undefined,
    );
  }, [status, accessToken, track.id]);

  const toggleFav = async () => {
    if (status !== "authenticated" || !accessToken) {
      window.location.href = `/login?next=${encodeURIComponent(`/calm-music/${track.slug}`)}`;
      return;
    }
    setFavBusy(true);
    try {
      const s = await audioApi.toggleFavorite(track.id, accessToken);
      setFav(s.favorite);
    } catch { /* keep prior state */ } finally { setFavBusy(false); }
  };

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/calm-music" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />Back to calm music
      </Link>
      <div className="mt-4 overflow-hidden rounded-3xl border border-border-soft bg-surface">
        <div className="relative h-56 sm:h-64"><CoverImage src={track.coverImageUrl} alt="" /></div>
        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold tracking-widest text-primary-700 uppercase">{CATEGORY_LABEL[track.category]} · {minutesOf({ durationSeconds: track.durationSeconds } as never)}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-heading">{track.title}</h1>
          {track.description ? <p className="mt-2 text-sm leading-relaxed text-body">{track.description}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button type="button" onClick={() => play({ id: track.id, title: track.title, slug: track.slug, description: track.description, category: track.category, durationSeconds: track.durationSeconds, coverImageUrl: track.coverImageUrl, tags: track.tags, publishedAt: track.publishedAt ?? new Date().toISOString() })}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-600 px-6 text-sm font-semibold text-white hover:bg-primary-700">
              {active ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}{active ? "Pause" : "Play"}
            </button>
            <button type="button" onClick={() => void toggleFav()} disabled={favBusy} aria-pressed={fav} className={cn("inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium", fav ? "border-primary-400 bg-primary-50 text-primary-700" : "border-border-soft text-heading")}>
              <Heart className={cn("size-4", fav && "fill-current")} aria-hidden="true" />{fav ? "Favourited" : "Favourite"}
            </button>
            {track.downloadable ? (
              <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-soft px-5 text-sm text-muted"><Download className="size-4" aria-hidden="true" />{status === "authenticated" ? "Download available in app" : "Sign in to download"}</span>
            ) : (
              <span className="inline-flex min-h-11 items-center rounded-full bg-surface-tint px-5 text-sm text-muted">Stream-only</span>
            )}
          </div>
          <p className="mt-3 text-xs text-muted">{track.creator ? `By ${track.creator} · ` : ""}{track.license ?? "Licensed for calm listening."}</p>
        </div>
      </div>
    </article>
  );
}
void ApiError;
