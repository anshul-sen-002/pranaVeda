"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ListMusic, Plus, X } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { meApi } from "@/lib/api/me";
import type { RoutineDto, RoutineSummaryDto } from "@/lib/api/types";

export function AddToRoutineButton({ contentId, contentTitle }: { contentId: number; contentTitle: string }) {
  const { status, accessToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [routines, setRoutines] = useState<RoutineSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !accessToken) return;
    let active = true;
    setLoading(true);
    meApi.routines(accessToken).then((items) => { if (active) setRoutines(items); })
      .catch((err: unknown) => { if (active) setError(err instanceof ApiError ? err.message : "Could not load routines."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, accessToken]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const addToRoutine = async (routine: RoutineSummaryDto) => {
    if (!accessToken) return;
    setBusyId(routine.id);
    setError(null);
    try {
      const current: RoutineDto = await meApi.routine(accessToken, routine.id);
      if (current.items.some((item) => item.contentId === contentId)) {
        setNotice(`“${contentTitle}” is already in ${routine.name}.`);
        return;
      }
      await meApi.updateRoutine(accessToken, current.id, {
        name: current.name,
        description: current.description ?? "",
        items: [...current.items.map((item) => ({ contentId: item.contentId, durationSeconds: item.durationSeconds, note: item.note })), { contentId }],
      });
      setNotice(`Added to ${routine.name}.`);
      setRoutines((items) => items.map((item) => item.id === routine.id ? { ...item, itemCount: item.itemCount + 1 } : item));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add this pose to the routine.");
    } finally { setBusyId(null); }
  };

  const createRoutine = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const routine = await meApi.createRoutine(accessToken, { name: name.trim(), items: [{ contentId }] });
      setRoutines((items) => [{ ...routine, itemCount: routine.items.length }, ...items]);
      setName("");
      setNotice(`Created ${routine.name} and added “${contentTitle}”.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the routine.");
    } finally { setCreating(false); }
  };

  const show = () => {
    if (status !== "authenticated" || !accessToken) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setOpen(true);
    setError(null);
    setNotice(null);
  };

  return <>
    <button type="button" onClick={show} disabled={status === "loading"} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-border-soft bg-surface px-4 text-sm font-medium text-heading transition-colors hover:border-primary-300 hover:text-primary-700 disabled:opacity-50">
      <ListMusic className="size-4" aria-hidden="true" /> Add to routine
    </button>
    {open ? <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="add-routine-title" className="max-h-[min(90svh,90dvh)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-3xl border border-border-soft bg-white px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="add-routine-title" className="text-lg font-semibold text-heading">Add pose to a routine</h2><p className="mt-1 text-sm text-muted">{contentTitle}</p></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-primary-50 hover:text-heading"><X className="size-4" aria-hidden="true" /></button>
        </div>
        {error ? <p className="mt-4 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger" role="alert">{error}</p> : null}
        {notice ? <p className="mt-4 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-800" role="status">{notice}</p> : null}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-heading">Your routines</h3>
          {loading ? <p className="py-4 text-sm text-muted" role="status">Loading routines…</p> : routines.length ? <ul className="mt-2 divide-y divide-border-soft rounded-2xl border border-border-soft">
            {routines.map((routine) => <li key={routine.id} className="flex items-center gap-3 px-3 py-2.5">
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-heading">{routine.name}</span><span className="text-xs text-muted">{routine.itemCount} {routine.itemCount === 1 ? "pose" : "poses"}</span></span>
              <button type="button" onClick={() => void addToRoutine(routine)} disabled={busyId !== null} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border-soft px-3 text-xs font-semibold text-primary-700 hover:border-primary-300 disabled:opacity-50">{busyId === routine.id ? "Adding…" : <><Plus className="size-3.5" aria-hidden="true" /> Add</>}</button>
            </li>)}
          </ul> : <p className="mt-2 rounded-2xl border border-dashed border-border-soft px-3 py-4 text-sm text-muted">No routines yet. Create one below with this pose included.</p>}
        </div>
        <form onSubmit={(event) => void createRoutine(event)} className="mt-5 space-y-2.5 border-t border-border-soft pt-4">
          <h3 className="text-sm font-semibold text-heading">Or create a routine</h3>
          <div className="flex gap-2"><input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required aria-label="New routine name" placeholder="e.g. Morning flow" className="h-10 min-w-0 flex-1 rounded-xl border border-border-soft px-3 text-sm" /><button type="submit" disabled={creating || !name.trim()} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">{creating ? "Creating…" : <><Check className="size-4" aria-hidden="true" /> Create</>}</button></div>
        </form>
      </section>
    </div> : null}
  </>;
}
