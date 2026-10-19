"use client";
import Link from "next/link";
import { EllipsisVertical, Music2, Play, Pause } from "lucide-react";
import type { AudioTrackSummary } from "@/lib/api/types";

import { CoverImage } from "@/components/media/CoverImage";
import { cn } from "@/lib/cn";

interface TrackCardProps {
  track: AudioTrackSummary;
  active: boolean;
  onToggle: () => void;
  categoryChip: Record<string, string>;
  categoryLabel: Record<string, string>;
  minutesOf: (t: AudioTrackSummary) => string;
}

/** Single track card — screenshot style: image left, text right, play button. */
export function TrackCard({ track, active, onToggle, categoryChip, categoryLabel, minutesOf }: TrackCardProps) {
  return (
    <article role="listitem" className="overflow-hidden rounded-2xl border border-border-soft bg-surface transition-shadow hover:shadow-[0_14px_36px_-24px_rgba(23,137,199,0.5)]">
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        <Link href={`/calm-music/${track.slug}`} className="relative block size-24 shrink-0 overflow-hidden rounded-xl bg-primary-50 sm:size-28" aria-label={track.title} tabIndex={-1}>
          <CoverImage src={track.coverImageUrl} alt="" className="h-full w-full object-cover" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <span className={cn("inline-flex max-w-[70%] items-center gap-1 truncate rounded-full px-2 py-0.5 text-[11px] font-medium sm:text-xs", categoryChip[track.category])}>
              {categoryLabel[track.category]}
            </span>
            <span className="flex shrink-0 items-center gap-0.5 text-muted" aria-hidden="true">
              <EllipsisVertical className="size-4" />
            </span>
          </div>
          <Link href={`/calm-music/${track.slug}`} className="mt-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300">
            <h3 className="line-clamp-1 text-sm font-semibold text-heading hover:text-primary-700 sm:text-base">{track.title}</h3>
          </Link>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted tabular-nums sm:text-xs">
            <Music2 className="size-3.5" aria-hidden="true" />
            <span>{minutesOf(track)}</span>
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{track.description ?? ""}</p>
        </div>
        <button type="button" onClick={onToggle} aria-label={active ? `Pause ${track.title}` : `Play ${track.title}`} className={cn("inline-flex size-10 shrink-0 items-center justify-center self-center rounded-full border transition-colors", active ? "border-primary-600 bg-primary-600 text-white" : "border-primary-200 bg-surface text-primary-600 hover:bg-primary-50")}>
          {active ? <Pause className="size-4" aria-hidden="true" /> : <Play className="ml-0.5 size-4" aria-hidden="true" />}
        </button>
      </div>
      {active ? (
        <div className="h-1 bg-primary-100" aria-hidden="true"><div className="h-full bg-primary-500" style={{ width: "45%" }} /></div>
      ) : null}
    </article>
  );
}
