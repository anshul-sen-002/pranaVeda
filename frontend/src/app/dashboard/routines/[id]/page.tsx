"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowDown, ArrowUp, Plus, Search, Trash2 } from "lucide-react";

import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { listContent } from "@/lib/api/content";
import { meApi } from "@/lib/api/me";
import type { ContentSummary, RoutineDto, RoutineRequest } from "@/lib/api/types";

export default function RoutineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <MemberGuard><DashboardShell><RoutineDetail params={params} /></DashboardShell></MemberGuard>;
}

function RoutineDetail({ params }: { params: Promise<{ id: string }> }) {
  const { accessToken } = useAuth();
  const [id, setId] = useState<number | null>(null);
  const [routine, setRoutine] = useState<RoutineDto | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => { void params.then((value) => setId(Number(value.id))); }, [params]);
  const load = useCallback(async () => {
    if (!accessToken || id === null || Number.isNaN(id)) return;
    setLoading(true);
    try {
      const value = await meApi.routine(accessToken, id);
      setRoutine(value);
      setName(value.name);
      setDescription(value.description ?? "");
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load routine.");
    } finally { setLoading(false); }
  }, [accessToken, id]);
  useEffect(() => { void load(); }, [load]);

  const requestFor = (current: RoutineDto, updates: Partial<RoutineRequest> = {}): RoutineRequest => ({
    name: updates.name ?? current.name,
    description: updates.description ?? current.description ?? "",
    items: updates.items ?? current.items.map((item) => ({
      contentId: item.contentId,
      durationSeconds: item.durationSeconds,
      note: item.note,
    })),
  });

  const save = async (request: RoutineRequest, success: string) => {
    if (!accessToken || !routine || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await meApi.updateRoutine(accessToken, routine.id, request);
      setRoutine(updated);
      setName(updated.name);
      setDescription(updated.description ?? "");
      setNotice(success);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your routine.");
    } finally { setSaving(false); }
  };

  const saveDetails = (event: FormEvent) => {
    event.preventDefault();
    if (!routine || !name.trim()) return;
    void save(requestFor(routine, { name: name.trim(), description: description.trim() }), "Routine details saved.");
  };

  const search = async (event: FormEvent) => {
    event.preventDefault();
    setSearching(true);
    setError(null);
    try {
      const page = await listContent({ q: q.trim() || undefined, type: "ASANA", size: 8 });
      setResults(page.content);
      if (page.content.length === 0) setNotice("No published poses matched that search.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not search poses.");
    } finally { setSearching(false); }
  };

  const changeItems = (items: RoutineDto["items"]) => {
    if (!routine) return;
    void save(requestFor(routine, { items: items.map((item) => ({ contentId: item.contentId, durationSeconds: item.durationSeconds, note: item.note })) }), "Pose sequence updated.");
  };
  const addPose = (contentId: number) => {
    if (!routine || routine.items.some((item) => item.contentId === contentId)) return;
    changeItems([...routine.items, { id: -contentId, contentId, position: routine.items.length, content: results.find((item) => item.id === contentId) ?? null }]);
  };
  const removePose = (index: number) => {
    if (!routine) return;
    changeItems(routine.items.filter((_, itemIndex) => itemIndex !== index));
  };
  const movePose = (index: number, direction: -1 | 1) => {
    if (!routine) return;
    const items = [...routine.items];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    changeItems(items);
  };

  if (loading) return <p className="text-sm text-muted" role="status">Loading routine…</p>;
  if (!routine) return <div className="space-y-4"><Link href="/dashboard/routines" className="inline-flex items-center gap-2 text-sm text-primary-700"><ArrowLeft className="size-4 text-black" /> My routines</Link>{error ? <p className="rounded-2xl bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">{error}</p> : null}</div>;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <Link href="/dashboard/routines" className="inline-flex min-h-9 items-center gap-2 text-sm font-medium text-primary-700 hover:underline"><ArrowLeft className="size-4 text-black" aria-hidden="true" /> My routines</Link>
      <PageHeader title={routine.name} subtitle={`${routine.items.length} ${routine.items.length === 1 ? "pose" : "poses"} in your sequence`} />
      {error ? <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">{error}</p> : null}
      {notice ? <p className="rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800" role="status">{notice}</p> : null}

      <form onSubmit={saveDetails} className="space-y-3 rounded-3xl border border-border-soft bg-surface p-4 sm:p-5">
        <h2 className="text-base font-semibold text-heading">Routine details</h2>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-heading">Name</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required className="h-11 w-full rounded-xl border border-border-soft bg-white px-3 text-sm text-heading focus:border-primary-300 focus:ring-2 focus:ring-primary-200 focus:outline-none" /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-heading">Description <span className="font-normal text-muted">(optional)</span></span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} placeholder="What is this routine for?" className="w-full rounded-xl border border-border-soft bg-white px-3 py-2.5 text-sm text-heading focus:border-primary-300 focus:ring-2 focus:ring-primary-200 focus:outline-none" /></label>
        <button type="submit" disabled={saving || !name.trim()} className="min-h-10 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">{saving ? "Saving…" : "Save details"}</button>
      </form>

      <section className="space-y-3" aria-labelledby="sequence-heading">
        <div><h2 id="sequence-heading" className="text-lg font-semibold text-heading">Pose sequence</h2><p className="text-sm text-muted">Move poses to change the order you want to practice.</p></div>
        {routine.items.length === 0 ? <p className="rounded-2xl border border-dashed border-border-soft bg-surface px-5 py-8 text-center text-sm text-muted">This routine is empty. Search for a pose below to get started.</p> : (
          <ol className="divide-y divide-border-soft overflow-hidden rounded-3xl border border-border-soft bg-white">
            {routine.items.map((item, index) => <li key={`${item.id}-${item.contentId}`} className="flex items-center gap-3 px-3 py-3 sm:px-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">{index + 1}</span>
              {item.content?.featuredImageUrl ? <img src={item.content.featuredImageUrl} alt="" className="size-11 shrink-0 rounded-xl object-cover" /> : null}
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-heading">{item.content?.title ?? `Pose ${item.contentId}`}</span>
              <button type="button" onClick={() => movePose(index, -1)} disabled={saving || index === 0} aria-label={`Move ${item.content?.title ?? "pose"} up`} className="inline-flex size-9 items-center justify-center rounded-full text-body hover:bg-primary-50 disabled:opacity-30"><ArrowUp className="size-4" aria-hidden="true" /></button>
              <button type="button" onClick={() => movePose(index, 1)} disabled={saving || index === routine.items.length - 1} aria-label={`Move ${item.content?.title ?? "pose"} down`} className="inline-flex size-9 items-center justify-center rounded-full text-body hover:bg-primary-50 disabled:opacity-30"><ArrowDown className="size-4" aria-hidden="true" /></button>
              <button type="button" onClick={() => removePose(index)} disabled={saving} aria-label={`Remove ${item.content?.title ?? "pose"}`} className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-50"><Trash2 className="size-4" aria-hidden="true" /></button>
            </li>)}
          </ol>
        )}
      </section>

      <section aria-label="Add poses" className="rounded-3xl border border-border-soft bg-surface p-4 sm:p-5">
        <h2 className="text-base font-semibold text-heading">Add a pose</h2>
        <p className="mt-1 text-sm text-muted">Search published asanas to add them to your sequence.</p>
        <form onSubmit={(event) => void search(event)} className="mt-3 flex gap-2">
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search yoga poses" aria-label="Search yoga poses" className="h-11 min-w-0 flex-1 rounded-xl border border-border-soft bg-white px-3 text-sm" />
          <button type="submit" disabled={searching || saving} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"><Search className="size-4" aria-hidden="true" />{searching ? "Searching…" : "Search"}</button>
        </form>
        {results.length > 0 ? <ul className="mt-3 divide-y divide-border-soft rounded-2xl border border-border-soft bg-white">{results.map((pose) => {
          const added = routine.items.some((item) => item.contentId === pose.id);
          return <li key={pose.id} className="flex items-center gap-3 px-3 py-2.5">
            {pose.featuredImageUrl ? <img src={pose.featuredImageUrl} alt="" className="size-10 shrink-0 rounded-lg object-cover" /> : null}
            <span className="min-w-0 flex-1 truncate text-sm text-heading">{pose.title}</span>
            <button type="button" onClick={() => addPose(pose.id)} disabled={saving || added} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-border-soft px-3 text-xs font-semibold text-primary-700 hover:border-primary-300 disabled:opacity-50">{added ? "Added" : <><Plus className="size-3.5" aria-hidden="true" /> Add</>}</button>
          </li>;
        })}</ul> : null}
      </section>
    </div>
  );
}
