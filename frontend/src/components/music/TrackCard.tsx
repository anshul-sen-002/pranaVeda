"use client";
import Link from "next/link";
import { Play, Pause } from "lucide-react";
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

/** Single track card — compact on phones, richer on desktop. */
export function TrackCard({ track, active, onToggle, categoryChip, categoryLabel, minutesOf }: TrackCardProps) {
  const pct = active ? 45 : 0;
  return (
    <article role="listitem" className="overflow-hidden rounded-2xl border border-border-soft bg-surface transition-shadow hover:shadow-[0_14px_36px_-24px_rgba(23,137,199,0.5)]">
      <Link href={`/calm-music/${track.slug}`} className="block">
        <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full bg-primary-50">
          <CoverImage src={track.coverImageUrl} alt="" className="h-full w-full object-cover" />
          <span className={cn("absolute top-2 left-2 inline-flex max-w-[70%] items-center gap-1 truncate rounded-full bg-surface/95 px-2 py-0.5 text-[11px] font-medium shadow-sm backdrop-blur sm:px-2.5 sm:py-1 sm:text-xs", categoryChip[track.category])}>
            {categoryLabel[track.category]}
          </span>
          <button type="button" onClick={(e) => { e.stopPropagation(); onToggle(); }} aria-label={active ? `Pause ${track.title}` : `Play ${track.title}`} className={cn("absolute right-2 bottom-2 inline-flex size-11 items-center justify-center rounded-full", active ? "bg-primary-600 text-white" : "bg-surface/95 text-primary-700 shadow-sm")}>
            {active ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
          </button>
          {active ? (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-100"><div className="h-full bg-primary-500" style={{ width: `${pct}%` }} /></div>
          ) : null}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="line-clamp-1 text-sm font-semibold text-heading sm:text-base">{track.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted sm:text-[13px]">{track.description ?? ""}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted tabular-nums sm:text-xs">
            <span>{minutesOf(track)}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
