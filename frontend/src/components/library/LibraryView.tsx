"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  RotateCw,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { listContent } from "@/lib/api/content";
import { SORTS, hasActiveFilters, parseParams, toSearchParams } from "@/lib/library/params";
import type {
  CategoryDto,
  ContentListParams,
  ContentSummary,
  PageResponse,
  TagDto,
} from "@/lib/api/types";
import { ContentCard } from "./ContentCard";
import { ContentCardSkeleton } from "./ContentCardSkeleton";
import { LibraryFilters } from "./LibraryFilters";

const DEFAULT_PARAMS: ContentListParams = { sort: "newest", page: 0, size: 12 };

const SORT_SELECT_CLASS =
  "appearance-none rounded-xl border border-border-soft bg-surface px-3 py-2 pr-8 text-sm text-heading transition-colors focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200";

interface LibraryViewProps {
  categories: CategoryDto[];
  tags: TagDto[];
}

/**
 * Interactive body of the public yoga library (agents.md 2.1 / 2.5).
 *
 * The URL is the single source of truth for filter state: it is read with
 * useSearchParams (so this view must render inside a <Suspense> boundary) and
 * written with router.replace, which keeps results shareable and makes the
 * back button work. The search box is the only locally-buffered value and is
 * debounced before it reaches the URL.
 */
export function LibraryView({ categories, tags }: LibraryViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.toString();
  const params = useMemo<ContentListParams>(
    () => parseParams(new URLSearchParams(query)),
    [query],
  );
  const queryKey = useMemo(() => toSearchParams(params).toString(), [params]);

  // Local buffer for the search box so typing stays instant.
  const [qInput, setQInput] = useState(() => params.q ?? "");
  const [reloadKey, setReloadKey] = useState(0);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Result of the last settled request. `loading` is *derived* by comparing
   * the key it settled against with the current one, so nothing has to call
   * setState synchronously inside the effect below.
   */
  const [result, setResult] = useState<{
    key: string;
    page: PageResponse<ContentSummary> | null;
    error: string | null;
  } | null>(null);

  // Fetch whenever filters change. In-flight requests are aborted so a fast
  // filter change can never paint stale results over fresh ones.
  useEffect(() => {
    const controller = new AbortController();
    listContent(params, controller.signal)
      .then((page) => setResult({ key: queryKey, page, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          key: queryKey,
          page: null,
          error: err instanceof Error ? err.message : "Could not load the library.",
        });
      });
    return () => controller.abort();
  }, [params, queryKey, reloadKey]);

  /** Write filter state back to the address bar (no full page navigation). */
  const applyParams = useCallback(
    (next: ContentListParams) => {
      const search = toSearchParams(next).toString();
      router.replace(`${pathname}${search ? `?${search}` : ""}`, { scroll: false });
    },
    [router, pathname],
  );

  // Debounced search: one navigation per pause, always back to page 0.
  useEffect(() => {
    if ((params.q ?? "") === qInput.trim()) return;
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      applyParams({ ...params, q: qInput.trim() || undefined, page: 0 });
    }, 350);
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [qInput, params, applyParams]);

  // Filter changes reset pagination; pagination uses setPage instead.
  const patch = useCallback(
    (next: Partial<ContentListParams>) => {
      applyParams({ ...params, page: 0, ...next });
    },
    [params, applyParams],
  );

  const setPage = useCallback(
    (page: number) => {
      applyParams({ ...params, page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [params, applyParams],
  );

  const toggleTag = useCallback(
    (slug: string) => {
      const current = params.tags ?? [];
      const tagsNext = current.includes(slug)
        ? current.filter((t) => t !== slug)
        : [...current, slug];
      applyParams({ ...params, tags: tagsNext, page: 0 });
    },
    [params, applyParams],
  );

  const reset = useCallback(() => {
    setQInput("");
    applyParams({ ...DEFAULT_PARAMS });
  }, [applyParams]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  // Derived view state — no extra renders from a loading boolean.
  const loading = !result || result.key !== queryKey;
  const error = loading ? null : (result?.error ?? null);
  const data = loading ? null : (result?.page ?? null);

  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const page = params.page ?? 0;

  return (
    <div className="space-y-6">
      <LibraryFilters
        params={params}
        qInput={qInput}
        onQInput={setQInput}
        categories={categories}
        tags={tags}
        onPatch={patch}
        onToggleTag={toggleTag}
        onReset={reset}
      />

      {/* Result header: count + sort. Sort lives here, not in the toolbar. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {loading
            ? "Loading practices…"
            : `${total} ${total === 1 ? "practice" : "practices"}${
                hasActiveFilters(params) ? " matching your filters" : ""
              }`}
        </p>
        <label className="inline-flex items-center gap-2 text-sm text-muted">
          Sort
          <span className="relative inline-flex">
            <select
              className={cn(SORT_SELECT_CLASS, "min-w-40")}
              value={params.sort ?? "newest"}
              onChange={(e) =>
                patch({ sort: e.target.value as ContentListParams["sort"] })
              }
              aria-label="Sort results"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
          </span>
        </label>
      </div>

      {/* Error state — the rest of the page stays usable. */}
      {error && !loading ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
          <AlertTriangle className="size-8 text-danger" aria-hidden="true" />
          <div>
            <p className="font-medium text-heading">We couldn&apos;t load the library</p>
            <p className="mt-1 text-sm text-muted">{error}</p>
          </div>
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <RotateCw className="size-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : null}

      {/* Skeletons match the card footprint while the first page loads. */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: params.size ?? 12 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {!loading && !error && data && data.content.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.content.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}

      {/* Empty state — distinct from both loading and errors. */}
      {!loading && !error && data && data.content.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-soft bg-surface px-6 py-12 text-center">
          <Inbox className="size-8 text-primary-300" aria-hidden="true" />
          <div>
            <p className="font-medium text-heading">Nothing here yet</p>
            <p className="mt-1 text-sm text-muted">
              {hasActiveFilters(params)
                ? "No practices match these filters. Try clearing one."
                : "No published practices have been added yet — check back soon."}
            </p>
          </div>
          {hasActiveFilters(params) ? (
            <button
              type="button"
              onClick={reset}
              className="text-sm font-medium text-primary-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              Reset all filters
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Server-side pagination with a deterministic page size. */}
      {!loading && !error && totalPages > 1 ? (
        <nav className="flex items-center justify-center gap-2" aria-label="Library pages">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page <= 0}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border-soft bg-surface text-heading transition-colors hover:border-primary-200 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          <span className="px-2 text-sm text-muted">
            Page {page + 1} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border-soft bg-surface text-heading transition-colors hover:border-primary-200 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            aria-label="Next page"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
