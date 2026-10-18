"use client";

import { useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { CONTENT_TYPES, DIFFICULTIES, DURATIONS, GOALS } from "@/lib/library/params";
import type { CategoryDto, ContentListParams, TagDto } from "@/lib/api/types";

const SELECT_CLASS =
  "w-full appearance-none rounded-xl border border-border-soft bg-surface px-3 py-2 pr-8 text-sm text-heading transition-colors focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200";

interface LibraryFiltersProps {
  params: ContentListParams;
  qInput: string;
  onQInput: (value: string) => void;
  categories: CategoryDto[];
  tags: TagDto[];
  onPatch: (patch: Partial<ContentListParams>) => void;
  onToggleTag: (slug: string) => void;
  onReset: () => void;
}

function chipLabel(
  key: string,
  params: ContentListParams,
  categories: CategoryDto[],
): string | null {
  switch (key) {
    case "type":
      return params.type
        ? (CONTENT_TYPES.find((t) => t.value === params.type)?.label ?? null)
        : null;
    case "difficulty":
      return params.difficulty
        ? (DIFFICULTIES.find((d) => d.value === params.difficulty)?.label ?? null)
        : null;
    case "goal":
      return params.goal
        ? (GOALS.find((g) => g.value === params.goal)?.label ?? null)
        : null;
    case "category":
      return params.category
        ? (categories.find((c) => c.slug === params.category)?.name ?? params.category)
        : null;
    case "durationMax":
      return params.durationMax
        ? (DURATIONS.find((d) => d.value === params.durationMax)?.label ??
          `Up to ${params.durationMax} min`)
        : null;
    default:
      return null;
  }
}

/**
 * Presentational filter toolbar (agents.md 2.5). Every control writes straight
 * into URL-backed params so results stay shareable; the search box is the only
 * locally-buffered value (debounced by the parent view).
 */
export function LibraryFilters(props: LibraryFiltersProps) {
  const { params, qInput, onQInput, categories, tags, onPatch, onToggleTag, onReset } =
    props;
  // Collapsed on phones so the toolbar stays one calm row; open on sm+ by default.
  const [open, setOpen] = useState(false);
  const activeTagSlugs = new Set(params.tags ?? []);
  const hasActive =
    !!params.q ||
    !!params.type ||
    !!params.difficulty ||
    !!params.goal ||
    !!params.category ||
    !!params.durationMax ||
    activeTagSlugs.size > 0;
  const activeCount =
    (params.type ? 1 : 0) +
    (params.difficulty ? 1 : 0) +
    (params.goal ? 1 : 0) +
    (params.category ? 1 : 0) +
    (params.durationMax ? 1 : 0) +
    activeTagSlugs.size;
  const chipKeys = ["type", "difficulty", "goal", "category", "durationMax"];

  return (
    <div className="mobile-compact space-y-3 rounded-2xl border border-border-soft bg-surface p-3 sm:space-y-4 sm:p-5">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={qInput}
            onChange={(e) => onQInput(e.target.value)}
            placeholder="Search asanas…"
            aria-label="Search the yoga library"
            className="h-11 w-full rounded-xl border border-border-soft bg-surface pr-3 pl-9 text-sm text-heading placeholder:text-muted focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-border-soft px-3.5 text-sm font-medium text-heading sm:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>
      </div>
      <div className={cn(!open && "hidden", "space-y-3 sm:block sm:space-y-4")}>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Type</span>
          <select
            className={SELECT_CLASS}
            value={params.type ?? ""}
            onChange={(e) =>
              onPatch({ type: (e.target.value || undefined) as ContentListParams["type"] })
            }
          >
            <option value="">All types</option>
            {CONTENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Level</span>
          <select
            className={SELECT_CLASS}
            value={params.difficulty ?? ""}
            onChange={(e) =>
              onPatch({
                difficulty: (e.target.value || undefined) as ContentListParams["difficulty"],
              })
            }
          >
            <option value="">Any level</option>
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Goal</span>
          <select
            className={SELECT_CLASS}
            value={params.goal ?? ""}
            onChange={(e) => onPatch({ goal: e.target.value || undefined })}
          >
            <option value="">Any goal</option>
            {GOALS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Category</span>
          <select
            className={SELECT_CLASS}
            value={params.category ?? ""}
            onChange={(e) => onPatch({ category: e.target.value || undefined })}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Duration</span>
          <select
            className={SELECT_CLASS}
            value={params.durationMax ?? ""}
            onChange={(e) =>
              onPatch({ durationMax: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">Any length</option>
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {tags.length > 0 && (
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5 sm:flex-wrap">
          {tags.map((t) => {
            const on = activeTagSlugs.has(t.slug);
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => onToggleTag(t.slug)}
                aria-pressed={on}
                className={cn(
                  "min-h-9 shrink-0 rounded-full border px-3.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
                  on
                    ? "border-primary-300 bg-primary-100 text-primary-800"
                    : "border-border-soft bg-surface text-muted hover:border-primary-200 hover:text-heading",
                )}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      )}

      {hasActive && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border-soft pt-3">
          <span className="text-xs font-medium text-muted">Active:</span>
          {chipKeys.map((key) => {
            const label = chipLabel(key, params, categories);
            if (!label) return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onPatch({ [key]: undefined } as Partial<ContentListParams>)}
                className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800 transition-colors hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                {label}
                <X className="size-3" aria-hidden="true" />
                <span className="sr-only">Remove {label} filter</span>
              </button>
            );
          })}
          {activeTagSlugs.size > 0 && (
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800">
              {activeTagSlugs.size} tag{activeTagSlugs.size > 1 ? "s" : ""}
            </span>
          )}
          <button
            type="button"
            onClick={onReset}
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}


