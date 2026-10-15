import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { cn } from "@/lib/cn";
import { CONTENT_TYPE_META, DIFFICULTY_META } from "@/lib/library/contentMeta";
import type { ContentSummary } from "@/lib/api/types";

/**
 * Public library card (agents.md 2.1). Clicking it opens the public detail
 * page — no login required to browse. Uses a plain <img> so it works with any
 * remote host (e.g. Cloudinary) without extra Next image-domain config.
 */
export function ContentCard({ item }: { item: ContentSummary }) {
  const type = CONTENT_TYPE_META[item.contentType];
  const difficulty = DIFFICULTY_META[item.difficulty];
  const TypeIcon = type.icon;

  return (
    <Link
      href={`/yoga/${item.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_16px_40px_-24px_rgba(23,137,199,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
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
        <span
          className={cn(
            "absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            type.chip,
          )}
        >
          <TypeIcon className="size-3.5" aria-hidden="true" />
          {type.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", difficulty.dot)} aria-hidden="true" />
            {difficulty.label}
          </span>
          {item.durationMinutes ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                {item.durationMinutes} min
              </span>
            </>
          ) : null}
        </div>

        <h3 className="mt-2 text-lg font-semibold text-heading transition-colors group-hover:text-primary-700">
          {item.title}
        </h3>
        {item.sanskritName ? (
          <p className="text-xs text-muted italic">{item.sanskritName}</p>
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
