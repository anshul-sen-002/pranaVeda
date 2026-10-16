"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Inbox, TriangleAlert } from "lucide-react";
import { listContent } from "@/lib/api/content";
import { parseParams, toSearchParams } from "@/lib/library/params";
import type { ContentListParams, ContentSummary, PageResponse } from "@/lib/api/types";
import { ContentCard } from "./ContentCard";
import { ContentCardSkeleton } from "./ContentCardSkeleton";
import { LibrarySearch, LibrarySidebar } from "./LibrarySidebar";

const DEFP: ContentListParams = { sort: "newest", page: 0, size: 9 };

export function LibraryView() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const query = sp.toString();
  const params = useMemo(() => parseParams(new URLSearchParams(query)), [query]);
  const key = useMemo(() => toSearchParams(params).toString(), [params]);
  const [qInput, setQInput] = useState(() => params.q ?? "");
  const [reload, setReload] = useState(0);
  const deb = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [result, setResult] = useState<{ key: string; page: PageResponse<ContentSummary> | null; err: string | null } | null>(null);
  useEffect(() => {
    const c = new AbortController();
    listContent(params, c.signal).then((page) => setResult({ key, page, err: null })).catch((e: unknown) => {
      if (c.signal.aborted) return;
      setResult({ key, page: null, err: e instanceof Error ? e.message : "Could not load." });
    });
    return () => c.abort();
  }, [params, key, reload]);
  const apply = useCallback((n: ContentListParams) => {
    const s = toSearchParams(n).toString();
    router.replace(`${pathname}${s ? `?${s}` : ""}`, { scroll: false });
  }, [router, pathname]);
  useEffect(() => {
    if ((params.q ?? "") === qInput.trim()) return;
    if (deb.current) clearTimeout(deb.current);
    deb.current = setTimeout(() => apply({ ...params, q: qInput.trim() || undefined, page: 0 }), 350);
    return () => { if (deb.current) clearTimeout(deb.current); };
  }, [qInput, params, apply]);
  const patch = useCallback((n: Partial<ContentListParams>) => apply({ ...params, page: 0, ...n }), [params, apply]);
  const setPage = useCallback((pg: number) => { apply({ ...params, page: pg }); window.scrollTo({ top: 0, behavior: "smooth" }); }, [params, apply]);
  const reset = useCallback(() => { setQInput(""); apply({ ...DEFP }); }, [apply]);
  const loading = !result || result.key !== key;
  const err = loading ? null : result?.err ?? null;
  const data = loading ? null : (result?.page ?? null);
  const page = params.page ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const total = data?.totalElements ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="lg:sticky lg:top-20 lg:self-start">
        <LibrarySidebar params={params} qInput={qInput} onQInput={setQInput} onPatch={patch} onReset={reset} total={total} />
      </div>
      <div className="min-w-0">
        <div className="mt-3"><LibrarySearch value={qInput} onChange={setQInput} /></div>
        <div className="flex items-center justify-between gap-4 mt-4">
          <h2 className="text-lg font-semibold text-heading">All Poses{total !== null ? <span className="ml-2 text-sm font-normal text-muted">({total})</span> : null}</h2>
        </div>
        {loading ? <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 9 }).map((_, i) => <ContentCardSkeleton key={i} />)}</div> : null}
        {err ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger/5 px-6 py-12 text-center" role="alert">
            <TriangleAlert className="size-8 text-danger" aria-hidden="true" />
            <p className="font-medium text-heading">Could not load poses</p>
            <p className="text-sm text-muted">{err}</p>
            <button type="button" onClick={() => setReload((k) => k + 1)} className="h-10 rounded-full bg-gradient-primary px-5 text-sm font-medium text-white">Try again</button>
          </div>
        ) : null}
        {!loading && !err && data && data.content.length > 0 ? <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{data.content.map((it) => <ContentCard key={it.id} item={it} />)}</div> : null}
        {!loading && !err && data && data.content.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border-soft bg-surface px-6 py-12 text-center">
            <Inbox className="size-8 text-primary-300" aria-hidden="true" />
            <p className="font-medium text-heading">Nothing here yet</p>
            <p className="text-sm text-muted">No practices match these filters. Try clearing one.</p>
            <button type="button" onClick={reset} className="text-sm font-medium text-primary-700 underline-offset-2 hover:underline">Reset all filters</button>
          </div>
        ) : null}
        {!loading && !err && totalPages > 1 ? (
          <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Library pages">
            <button type="button" onClick={() => setPage(Math.max(0, page - 1))} disabled={page <= 0} className="inline-flex size-10 items-center justify-center rounded-full border border-border-soft bg-surface text-heading disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="size-5" aria-hidden="true" /></button>
            <span className="px-2 text-sm text-muted">Page {page + 1} of {totalPages}</span>
            <button type="button" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="inline-flex size-10 items-center justify-center rounded-full border border-border-soft bg-surface text-heading disabled:opacity-40" aria-label="Next page"><ChevronRight className="size-5" aria-hidden="true" /></button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
