import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { cn } from "@/lib/cn";
import { CONTENT_TYPE_META, DIFFICULTY_META } from "@/lib/library/contentMeta";
import type { ContentSummary } from "@/lib/api/types";

/**
 * Library card matching mockup 1: image with type chip (top-left) and
 * difficulty + duration pills overlaid at the bottom, then title,
 * sanskrit name, summary, and a "Read more" link. Public browsing — no login.
 */
export function ContentCard({ item }: { item: ContentSummary }) {
  const type = CONTENT_TYPE_META[item.contentType];
  const difficulty = DIFFICULTY_META[item.difficulty];
  const TypeIcon = type.icon;

  return (
    <Link
      href={`/yoga/${item.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_16px_40px_-24px_rgba(23,137,199,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-primary-50">
        {item.featuredImageUrl ? (
          <img
            src={item.featuredImageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary-300">
            <TypeIcon className="size-12" aria-hidden="true" />
          </div>
        )}

        {/* Type chip — top-left */}
        <span
          className={cn(
            "absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur",
            type.chip,
          )}
        >
          <TypeIcon className="size-3.5" aria-hidden="true" />
          {type.label}
        </span>

        {/* Difficulty + duration pills — bottom of the image */}
        <div className="absolute right-3 bottom-3 left-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
            <span className={cn("size-1.5 rounded-full", difficulty.dot)} aria-hidden="true" />
            {difficulty.label}
          </span>
          {item.durationMinutes ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-medium text-muted shadow-sm backdrop-blur">
              <Clock className="size-3.5" aria-hidden="true" />
              {item.durationMinutes} min
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-heading transition-colors group-hover:text-primary-700">
          {item.title}
        </h3>
        {item.sanskritName ? (
          <p className="mt-0.5 text-xs text-muted italic">{item.sanskritName}</p>
        ) : null}

        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{item.summary}</p>

        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-700">
          Read more
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
