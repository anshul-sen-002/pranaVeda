"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";

import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { formatDate } from "@/components/dashboard/dashboardUi";
import { useAuth } from "@/hooks/useAuth";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";
import type { PageResponse, PracticeSessionDto } from "@/lib/api/types";

const PAGE_SIZE = 10;

export default function HistoryPage() {
  return (
    <MemberGuard>
      <DashboardShell>
        <HistoryView />
      </DashboardShell>
    </MemberGuard>
  );
}

function HistoryView() {
  const { accessToken } = useAuth();
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<PracticeSessionDto> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      setData(await meApi.sessions(accessToken, page, PAGE_SIZE));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your history.");
    }
  }, [accessToken, page, reload]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Practice history" subtitle="Every session you have logged, newest first." />
      {error ? (
        <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">{error}</p>
      ) : null}
      {!data && !error ? <p className="text-sm text-muted">Loading…</p> : null}
      {data && data.content.length === 0 ? (
        <div className="rounded-3xl border border-border-soft bg-surface px-6 py-12 text-center">
          <Clock3 className="mx-auto size-8 text-primary-300" aria-hidden="true" />
          <p className="mt-3 font-medium text-heading">No sessions yet</p>
          <p className="mt-1 text-sm text-muted">Finish a practice and it will appear here.</p>
        </div>
      ) : null}
      {data && data.content.length > 0 ? (
        <ul className="divide-y divide-border-soft rounded-3xl border border-border-soft bg-surface">
          {data.content.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-heading">{s.content?.title ?? "General practice"}</p>
                <p className="text-xs text-muted">{formatDate(s.completedAt)} · {s.durationMinutes} min</p>
                {s.notes ? <p className="mt-1 text-xs text-muted italic">{s.notes}</p> : null}
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                Done
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {totalPages > 1 ? (
        <nav className="flex items-center gap-2" aria-label="History pages">
          <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page <= 0} className="inline-flex size-9 items-center justify-center rounded-xl border border-border-soft bg-surface text-body disabled:opacity-40" aria-label="Previous page">
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <span className="text-sm text-muted">Page {page + 1} of {totalPages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="inline-flex size-9 items-center justify-center rounded-xl border border-border-soft bg-surface text-body disabled:opacity-40" aria-label="Next page">
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
