import Link from "next/link";
import { ArrowRight, Clock, Heart } from "lucide-react";
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
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_16px_40px_-24px_rgba(23,137,199,0.5)]">
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
              "absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur",
              type.chip,
            )}
          >
            <TypeIcon className="size-3.5" aria-hidden="true" />
            {item.categories[0]?.name ?? type.label}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 pr-14">
          <h3 className="text-[15px] font-semibold text-heading transition-colors group-hover:text-primary-700">
            {item.title}
            {item.sanskritName ? <span className="font-normal text-muted"> ({item.sanskritName})</span> : null}
          </h3>
          <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-muted">{item.summary}</p>
          <p className="mt-3 flex items-center gap-3 text-xs text-muted">
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
          "absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-full bg-surface/95 shadow-sm backdrop-blur transition-colors hover:text-primary-700",
          saved ? "text-primary-600" : "text-muted",
        )}
      >
        <Heart className={cn("size-4", saved && "fill-current")} aria-hidden="true" />
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 bottom-4 inline-flex size-9 items-center justify-center rounded-full bg-primary-100/80 text-primary-700"
      >
        <ArrowRight className="size-4" />
      </span>
    </article>
  );
}
