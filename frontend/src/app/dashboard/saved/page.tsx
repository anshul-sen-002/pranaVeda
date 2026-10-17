"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";

import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CoverImage } from "@/components/media/CoverImage";
import { useAuth } from "@/hooks/useAuth";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";
import type { BookmarkTarget, SavedItemDto } from "@/lib/api/types";
import { CONTENT_TYPE_META } from "@/lib/library/contentMeta";
import { cn } from "@/lib/cn";

const FILTERS: { value: BookmarkTarget | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CONTENT", label: "Yoga" },
  { value: "AUDIO", label: "Audio" },
];

export default function SavedPage() {
  return (
    <MemberGuard>
      <DashboardShell>
        <SavedView />
      </DashboardShell>
    </MemberGuard>
  );
}

function SavedView() {
  const { accessToken } = useAuth();
  const [filter, setFilter] = useState<BookmarkTarget | "ALL">("ALL");
  const [items, setItems] = useState<SavedItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const page = await meApi.bookmarks(accessToken, {
        targetType: filter === "ALL" ? undefined : filter,
        size: 50,
      });
      setItems(page.content);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your saved library.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (item: SavedItemDto) => {
    if (!accessToken) return;
    setItems((prev) => prev.filter((i) => !(i.targetType === item.targetType && i.targetId === item.targetId)));
    try {
      await meApi.removeBookmark(accessToken, item.targetType, item.targetId);
    } catch {
      void load(); // restore on failure
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Saved library" subtitle="Practices and tracks you have bookmarked." />
      <div className="flex items-center gap-2" role="group" aria-label="Filter saved items">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={cn(
              "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors",
              filter === f.value ? "bg-primary-600 text-white" : "bg-surface text-body hover:bg-primary-50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {error ? <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">{error}</p> : null}
      {loading ? <p className="text-sm text-muted">Loading…</p> : null}
      {!loading && !error && items.length === 0 ? (
        <div className="rounded-3xl border border-border-soft bg-surface px-6 py-12 text-center">
          <Bookmark className="mx-auto size-8 text-primary-300" aria-hidden="true" />
          <p className="mt-3 font-medium text-heading">Nothing saved yet</p>
          <p className="mt-1 text-sm text-muted">Tap the heart on any practice to keep it here.</p>
          <Link href="/yoga" className="mt-4 inline-flex min-h-11 items-center rounded-full border border-border-soft px-5 text-sm font-medium text-primary-700 hover:border-primary-300 hover:bg-primary-50">
            Browse yoga
          </Link>
        </div>
      ) : null}
      {!loading && items.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const c = item.content;
            return (
              <li key={`${item.targetType}-${item.targetId}`} className="flex gap-3 rounded-2xl border border-border-soft bg-surface p-3.5">
                <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-primary-50">
                  {c ? <CoverImage src={c.featuredImageUrl} alt="" /> : <span className="flex h-full items-center justify-center text-primary-300"><Bookmark className="size-6" aria-hidden="true" /></span>}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  {item.available && c ? (
                    <>
                      <Link href={`/yoga/${c.slug}`} className="truncate text-sm font-semibold text-heading hover:text-primary-700">{c.title}</Link>
                      <p className="text-xs text-muted">{CONTENT_TYPE_META[c.contentType]?.label ?? item.targetType}</p>
                    </>
                  ) : (
                    <>
                      <p className="truncate text-sm font-medium text-heading">Unavailable item</p>
                      <p className="text-xs text-muted">This content is no longer published.</p>
                    </>
                  )}
                </div>
                <button type="button" onClick={() => void remove(item)} aria-label="Remove from saved" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger">
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
