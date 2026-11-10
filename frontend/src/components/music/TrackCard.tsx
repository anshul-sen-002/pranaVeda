"use client";

import Link from "next/link";
import { Clock3, Heart, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { AudioTrackSummary } from "@/lib/api/types";

import { CoverImage } from "@/components/media/CoverImage";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";
import { audioApi } from "@/lib/api/audio";

interface TrackCardProps {
  track: AudioTrackSummary;
  active: boolean;
  onToggle: () => void;
  categoryChip: Record<string, string>;
  categoryLabel: Record<string, string>;
  minutesOf: (t: AudioTrackSummary) => string;
}

/** Compact responsive row for one library track. */
export function TrackCard({ track, active, onToggle, categoryChip, categoryLabel, minutesOf }: TrackCardProps) {
  const { status, accessToken } = useAuth();
  const [favorite, setFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    let live = true;
    if (status === "authenticated" && accessToken) {
      audioApi.favoriteStatus(track.id, accessToken).then((result) => {
        if (live) setFavorite(result.favorite);
      }).catch(() => undefined);
    } else {
      setFavorite(false);
    }
    return () => { live = false; };
  }, [status, accessToken, track.id]);

  const toggleFavorite = async () => {
    if (status !== "authenticated" || !accessToken) {
      window.location.href = `/login?next=${encodeURIComponent("/calm-music")}`;
      return;
    }
    setFavoriteBusy(true);
    try {
      const result = await audioApi.toggleFavorite(track.id, accessToken);
      setFavorite(result.favorite);
    } catch {
      // Keep the last confirmed state when the request fails.
    } finally {
      setFavoriteBusy(false);
    }
  };

  return (
    <article role="listitem" className="group flex min-w-0 items-center gap-3 border-b border-[#edf0eb] py-3 last:border-b-0 sm:gap-4 sm:py-3.5">
      <Link href={`/calm-music/${track.slug}`} className="block size-14 shrink-0 overflow-hidden rounded-lg bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 sm:size-16" aria-label={`View ${track.title}`}>
        <CoverImage src={track.coverImageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <Link href={`/calm-music/${track.slug}`} className="min-w-0 max-w-full rounded text-sm font-semibold text-heading hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 sm:text-[15px]">
            <span className="line-clamp-1">{track.title}</span>
          </Link>
          <span className={cn("inline-flex max-w-full shrink-0 items-center truncate rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-[11px]", categoryChip[track.category])}>{categoryLabel[track.category]}</span>
        </div>
        <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-muted sm:text-[13px]">{track.description || "A calming soundscape for your practice."}</p>
      </div>
      <span className="hidden shrink-0 items-center gap-1.5 text-xs text-muted tabular-nums sm:flex"><Clock3 className="size-3.5" aria-hidden="true" />{minutesOf(track)}</span>
      <span className="sr-only sm:hidden">{minutesOf(track)}</span>
      <button type="button" onClick={() => void toggleFavorite()} disabled={favoriteBusy || status === "loading"} aria-pressed={favorite} aria-label={favorite ? `Remove ${track.title} from saved audio` : `Save ${track.title} to saved audio`} className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-50", favorite ? "border-primary-300 bg-primary-50 text-primary-700" : "border-transparent text-muted hover:bg-primary-50 hover:text-primary-700")}>
        <Heart className={cn("size-4", favorite && "fill-current")} aria-hidden="true" />
      </button>
      <button type="button" onClick={onToggle} aria-label={active ? `Pause ${track.title}` : `Play ${track.title}`} className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300", active ? "border-primary-700 bg-primary-700 text-white" : "border-primary-300 bg-white text-primary-700 hover:bg-primary-50")}>
        {active ? <Pause className="size-4" aria-hidden="true" /> : <Play className="ml-0.5 size-4" aria-hidden="true" />}
      </button>
    </article>
  );
}
