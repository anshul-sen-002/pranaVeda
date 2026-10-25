"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Inbox, Search, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { listContent } from "@/lib/api/content";
import { parseParams, toSearchParams, CONTENT_TYPES, DIFFICULTIES } from "@/lib/library/params";
import type { ContentListParams, ContentType, ContentSummary, PageResponse } from "@/lib/api/types";
import { ContentCard } from "./ContentCard";
import { ContentCardSkeleton } from "./ContentCardSkeleton";

const DEFP: ContentListParams = { sort: "newest", page: 0, size: 9 };

const SORT_OPTIONS: { value: ContentListParams["sort"]; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "duration_asc", label: "Shortest first" },
];

/**
 * Yoga Poses listing (mockup 1): search + sort row, filter chips,
 * card grid, numbered pagination. URL stays the single source of truth
 * for filter state (shareable links, working back button).
 *
 * `fixedType` pins the listing to one content type (e.g. the public
 * "Yoga Videos" page). The type is merged into every request and the
 * type filter chips are hidden so the page can never drift off-type.
 */
export function LibraryView({ fixedType }: { fixedType?: ContentType }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const query = sp.toString();
  const params = useMemo(() => {
    const parsed = parseParams(new URLSearchParams(query));
    return fixedType ? { ...parsed, type: fixedType } : parsed;
  }, [query, fixedType]);
  const key = useMemo(() => toSearchParams(params).toString(), [params]);
  const [qInput, setQInput] = useState(() => params.q ?? "");
  const [reload, setReload] = useState(0);
  const deb = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [result, setResult] = useState<{
    key: string;
    page: PageResponse<ContentSummary> | null;
    err: string | null;
  } | null>(null);

  useEffect(() => {
    const c = new AbortController();
    listContent(params, c.signal)
      .then((page) => setResult({ key, page, err: null }))
      .catch((e: unknown) => {
        if (c.signal.aborted) return;
        setResult({ key, page: null, err: e instanceof Error ? e.message : "Could not load the library." });
      });
    return () => c.abort();
  }, [params, key, reload]);

  const apply = useCallback(
    (n: ContentListParams) => {
      const s = toSearchParams(n).toString();
      router.replace(`${pathname}${s ? `?${s}` : ""}`, { scroll: false });
    },
    [router, pathname],
  );

  useEffect(() => {
    if ((params.q ?? "") === qInput.trim()) return;
    if (deb.current) clearTimeout(deb.current);
    deb.current = setTimeout(() => apply({ ...params, q: qInput.trim() || undefined, page: 0 }), 350);
    return () => {
      if (deb.current) clearTimeout(deb.current);
    };
  }, [qInput, params, apply]);

  const patch = useCallback(
    (n: Partial<ContentListParams>) => apply({ ...params, page: 0, ...n }),
    [params, apply],
  );
  const setPage = useCallback(
    (pg: number) => {
      apply({ ...params, page: pg });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [params, apply],
  );
  const reset = useCallback(() => {
    setQInput("");
    apply({ ...DEFP });
  }, [apply]);

  const loading = !result || result.key !== key;
  const err = loading ? null : (result?.err ?? null);
  const data = loading ? null : (result?.page ?? null);
  const page = params.page ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const total = data?.totalElements ?? null;
  const hasFilters = Boolean(params.difficulty || params.type || params.goal || params.durationMax);


  return (
    <div className="rounded-3xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30">
      {/* Search + sort row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center px-3 sm:px-6 pt-3 pb-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search poses, focus areas, or difficulty…"
            aria-label="Search yoga poses"
            className="h-11 w-full max-w-xs sm:w-full rounded-full border border-border-soft bg-surface pr-4 pl-11 text-sm text-heading placeholder:text-muted focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        <label className="relative inline-flex items-center gap-2 text-sm text-muted sm:w-auto">
          <span className="hidden sm:inline">Sort by</span>
          <select
            value={params.sort ?? "newest"}
            onChange={(e) => patch({ sort: e.target.value as ContentListParams["sort"] })}
            aria-label="Sort library results"
            className="h-11 w-full appearance-none rounded-full border border-border-soft bg-surface px-4 pr-9 text-sm text-heading focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200 sm:w-auto"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 size-4 -translate-y-1/2 text-muted sm:right-4"
            aria-hidden="true"
          />
        </label>
      </div>

      {/* Filter chips */}
      <div className="scrollbar-none mt-4 flex flex-wrap items-center gap-2 px-3 sm:px-6" role="group" aria-label="Filter poses">
        <Chip active={!params.difficulty && !params.type} label="All" onClick={() => patch({ difficulty: undefined, type: undefined })} />
        {DIFFICULTIES.map((d) => (
          <Chip
            key={d.value}
            active={params.difficulty === d.value}
            label={d.label}
            onClick={() => patch({ difficulty: params.difficulty === d.value ? undefined : d.value })}
          />
        ))}
        <span className="mx-1 hidden h-5 w-px bg-border-soft sm:block" aria-hidden="true" />
        {fixedType ? null : CONTENT_TYPES.map((t) => (
          <Chip
            key={t.value}
            active={params.type === t.value}
            label={t.label}
            onClick={() => patch({ type: params.type === t.value ? undefined : t.value })}
          />
        ))}
        {hasFilters ? (
          <button
            type="button"
            onClick={() => patch({ difficulty: undefined, type: undefined, goal: undefined, durationMax: undefined })}
            className="ml-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear filters
          </button>
        ) : null}
      </div>

      {/* Result count */}
      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {loading ? "Loading poses…" : err ? null : total !== null ? `${total} pose${total === 1 ? "" : "s"}` : null}
      </p>


      {err ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger/5 px-6 py-12 text-center" role="alert">
          <TriangleAlert className="size-8 text-danger" aria-hidden="true" />
          <p className="font-medium text-heading">Could not load poses</p>
          <p className="text-sm text-muted">{err}</p>
          <button
            type="button"
            onClick={() => setReload((k) => k + 1)}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-primary px-5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {!loading && !err && data && data.content.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.content.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}

      {!loading && !err && data && data.content.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border-soft bg-surface px-6 py-12 text-center">
          <Inbox className="size-8 text-primary-300" aria-hidden="true" />
          <p className="font-medium text-heading">Nothing here yet</p>
          <p className="text-sm text-muted">No practices match these filters. Try clearing one.</p>
          <button
            type="button"
            onClick={reset}
            className="text-sm font-medium text-primary-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            Reset all filters
          </button>
        </div>
      ) : null}


      {/* Numbered pagination (bottom-left, mockup 1) */}
      {!loading && !err && totalPages > 1 ? (
        <nav className="mt-8 flex items-center gap-1.5" aria-label="Library pages">
          <PageBtn onClick={() => setPage(page - 1)} disabled={page <= 0} label="Previous page">
            <ChevronLeft className="size-4" aria-hidden="true" />
          </PageBtn>
          {Array.from({ length: totalPages }, (_, i) => i).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === page ? "page" : undefined}
              aria-label={`Page ${n + 1}`}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
                n === page
                  ? "bg-gradient-primary text-white shadow-[0_6px_16px_-8px_rgba(29,111,84,0.7)]"
                  : "text-body hover:bg-primary-50 hover:text-primary-700",
              )}
            >
              {n + 1}
            </button>
          ))}
          <PageBtn onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} label="Next page">
            <ChevronRight className="size-4" aria-hidden="true" />
          </PageBtn>
        </nav>
      ) : null}
    </div>
  );
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
        active
          ? "border-primary-500 bg-gradient-primary text-white shadow-[0_6px_16px_-8px_rgba(29,111,84,0.7)]"
          : "border-border-soft bg-surface text-body hover:border-primary-200 hover:text-primary-700",
      )}
    >
      {label}
    </button>
  );
}

function PageBtn({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-xl border border-border-soft bg-surface text-body transition-colors hover:border-primary-200 hover:text-primary-700 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
    >
      {children}
    </button>
  );
}

