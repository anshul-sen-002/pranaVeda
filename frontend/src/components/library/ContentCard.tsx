import Link from "next/link";
import { ArrowRight, Clock, Heart, Play } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { CoverImage } from "@/components/media/CoverImage";
import { CONTENT_TYPE_META, DIFFICULTY_META } from "@/lib/library/contentMeta";
import type { ContentSummary } from "@/lib/api/types";

/**
 * Yoga card matching screenshot 2: backend `featuredImageUrl` with the
 * shared fallback tile, favourite button, category chip, title, benefit
 * line, duration + difficulty row, and a detail arrow.
 */
export function ContentCard({ item }: { item: ContentSummary }) {
  const type = CONTENT_TYPE_META[item.contentType];
  const difficulty = item.difficulty ? DIFFICULTY_META[item.difficulty] : null;
  const TypeIcon = type.icon;
  const [saved, setSaved] = useState(false);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_16px_40px_-24px_rgba(29,111,84,0.5)]">
      <Link
        href={`/yoga/${item.slug}`}
        aria-label={`${item.title}${item.sanskritName ? ` (${item.sanskritName})` : ""}`}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        <div className="relative aspect-[16/10] w-full bg-primary-50">
          <CoverImage
            src={item.featuredImageUrl}
            alt=""
            imgClassName="transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className={cn(
              "absolute top-2 left-2 inline-flex max-w-[70%] items-center gap-1 truncate rounded-full bg-surface/95 px-2 py-0.5 text-[11px] font-medium shadow-sm backdrop-blur sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-xs",
              type.chip,
            )}
          >
            <TypeIcon className="size-3 shrink-0 sm:size-3.5" aria-hidden="true" />
            <span className="truncate">{item.categories[0]?.name ?? type.label}</span>
          </span>
          {item.featuredVideoUrl ? (
            <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-surface/95 px-2 py-0.5 text-[11px] font-medium shadow-sm backdrop-blur sm:right-3 sm:bottom-3 sm:px-2.5 sm:py-1 sm:text-xs">
              <Play className="size-3 shrink-0 fill-current text-primary-600" aria-hidden="true" />
              Play video
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-3.5 pr-12 sm:p-5 sm:pr-14">
          <h3 className="line-clamp-2 text-sm font-semibold text-heading transition-colors group-hover:text-primary-700 sm:text-[15px]">
            {item.title}
            {item.sanskritName ? <span className="font-normal text-muted"> ({item.sanskritName})</span> : null}
          </h3>
          <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-muted sm:text-[13px]">{item.summary}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted sm:mt-3 sm:text-xs">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {item.durationMinutes ? `${item.durationMinutes} min` : "Self-paced"}
            </span>
            {difficulty ? (
              <span className="inline-flex items-center gap-1.5">
                <span className={cn("size-1.5 rounded-full", difficulty.dot)} aria-hidden="true" />
                {difficulty.label}
              </span>
            ) : null}
          </p>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => setSaved((s) => !s)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${item.title} from saved` : `Save ${item.title}`}
        className={cn(
          "absolute top-2 right-2 inline-flex size-10 items-center justify-center rounded-full bg-surface/95 shadow-sm backdrop-blur transition-colors hover:text-primary-700 sm:top-3 sm:right-3 sm:size-9",
          saved ? "text-primary-600" : "text-muted",
        )}
      >
        <Heart className={cn("size-4", saved && "fill-current")} aria-hidden="true" />
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 bottom-3 hidden size-9 items-center justify-center rounded-full bg-primary-100/80 text-primary-700 sm:inline-flex"
      >
        <ArrowRight className="size-4" />
      </span>
    </article>
  );
}
