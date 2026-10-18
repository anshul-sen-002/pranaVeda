"use client";
import { useEffect, useState } from "react";
import { ArrowUpDown, GripVertical, Trash2 } from "lucide-react";
import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { meApi } from "@/lib/api/me";
import { listContent } from "@/lib/api/content";
import { ApiError } from "@/lib/api/client";
import type { ContentSummary, RoutineDto } from "@/lib/api/types";

/** Routine detail: reorder, rename, add poses from search, delete. */
export default function RoutineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <MemberGuard>
      <DashboardShell>
        <RoutineDetail params={params} />
      </DashboardShell>
    </MemberGuard>
  );
}

function RoutineDetail({ params }: { params: Promise<{ id: string }> }) {
  const { accessToken } = useAuth();
  const [id, setId] = useState<number | null>(null);
  const [routine, setRoutine] = useState<RoutineDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ContentSummary[]>([]);
  useEffect(() => { void params.then((p) => setId(Number(p.id))); }, [params]);
  useEffect(() => {
    if (!accessToken || id == null || Number.isNaN(id)) return;
    meApi.routine(accessToken, id).then(setRoutine, (err: unknown) =>
      setError(err instanceof ApiError ? err.message : "Could not load routine."));
  }, [accessToken, id]);
  const search = async () => {
    try {
      const page = await listContent({ q: q.trim() || undefined, size: 8 });
      setResults(page.content);
    } catch { /* noop */ }
  };
  const saveOrder = async (ids: number[]) => {
    if (!accessToken || !routine) return;
    try {
      const updated = await meApi.updateRoutine(accessToken, routine.id, { name: routine.name, description: routine.description ?? undefined, isPublic: routine.isPublic, contentIds: ids });
      setRoutine(updated);
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not save order."); }
  };
  const move = (from: number, dir: -1 | 1) => {
    if (!routine) return;
    const ids = routine.items.map((i) => i.contentId);
    const to = from + dir;
    if (to < 0 || to >= ids.length) return;
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    void saveOrder(ids);
  };
  const addPose = (contentId: number) => {
    if (!routine) return;
    void saveOrder([...routine.items.map((i) => i.contentId), contentId]);
  };
  const removePose = (contentId: number) => {
    if (!routine) return;
    void saveOrder(routine.items.map((i) => i.contentId).filter((c) => c !== contentId));
  };
  if (error) return <p className="rounded-2xl bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">{error}</p>;
  if (!routine) return <p className="text-sm text-muted">Loading…</p>;
  return (
    <div className="space-y-5">
      <PageHeader title={routine.name} subtitle={`${routine.items.length} poses · reorder and save`} />
      <ol className="divide-y divide-border-soft rounded-3xl border border-border-soft bg-surface">
        {routine.items.length === 0 ? <li className="px-5 py-8 text-center text-sm text-muted">Empty — search below to add poses.</li> :
          routine.items.map((item, idx) => (
            <li key={item.id} className="flex items-center gap-2 px-4 py-3">
              <GripVertical className="size-4 shrink-0 text-muted" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm text-heading">{item.content?.title ?? `Pose ${item.contentId}`}</span>
              <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="Move up" className="inline-flex size-8 items-center justify-center rounded-full text-body disabled:opacity-30"><ArrowUpDown className="size-4 rotate-180" aria-hidden="true" /></button>
              <button type="button" onClick={() => move(idx, 1)} disabled={idx === routine.items.length - 1} aria-label="Move down" className="inline-flex size-8 items-center justify-center rounded-full text-body disabled:opacity-30"><ArrowUpDown className="size-4" aria-hidden="true" /></button>
              <button type="button" onClick={() => removePose(item.contentId)} aria-label="Remove pose" className="inline-flex size-8 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"><Trash2 className="size-4" aria-hidden="true" /></button>
            </li>
          ))}
      </ol>
      <section aria-label="Add poses" className="rounded-3xl border border-border-soft bg-surface p-4">
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void search(); } }} placeholder="Search poses…" aria-label="Search poses" className="h-11 flex-1 rounded-xl border border-border-soft px-3 text-sm" />
          <button type="button" onClick={() => void search()} className="inline-flex min-h-11 items-center rounded-full bg-primary-600 px-5 text-sm font-semibold text-white">Search</button>
        </div>
        {results.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {results.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-heading">{c.title}</span>
                <button type="button" onClick={() => addPose(c.id)} className="shrink-0 rounded-full border border-border-soft px-3 py-1 text-xs font-medium text-primary-700 hover:border-primary-300">Add</button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
