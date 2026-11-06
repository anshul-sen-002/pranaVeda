"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ListMusic, Plus, Trash2 } from "lucide-react";

import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";
import type { RoutineSummaryDto } from "@/lib/api/types";

export default function RoutinesPage() {
  return (
    <MemberGuard>
      <DashboardShell>
        <RoutinesView />
      </DashboardShell>
    </MemberGuard>
  );
}

function RoutinesView() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [routines, setRoutines] = useState<RoutineSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      setRoutines(await meApi.routines(accessToken));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load routines.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!accessToken || !name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const routine = await meApi.createRoutine(accessToken, { name: name.trim(), items: [] });
      router.push(`/dashboard/routines/${routine.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create routine.");
      setCreating(false);
    }
  };

  const remove = async (id: number) => {
    if (!accessToken || !window.confirm("Delete this routine and its pose sequence?")) return;
    setDeletingId(id);
    setError(null);
    try {
      await meApi.deleteRoutine(accessToken, id);
      setRoutines((previous) => previous.filter((routine) => routine.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete routine.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <PageHeader title="My routines" subtitle="Build an ordered sequence of poses and come back to it whenever you like." />

      <form onSubmit={create} className="flex flex-wrap items-end gap-3 rounded-3xl border border-border-soft bg-surface p-4 sm:p-5">
        <label className="min-w-56 flex-1">
          <span className="mb-1.5 block text-sm font-medium text-heading">Routine name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Wind-down stretch"
            maxLength={120}
            required
            className="h-11 w-full rounded-xl border border-border-soft bg-white px-3 text-sm text-heading focus:border-primary-300 focus:ring-2 focus:ring-primary-200 focus:outline-none"
          />
        </label>
        <button type="submit" disabled={creating || !name.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50">
          <Plus className="size-4" aria-hidden="true" />
          {creating ? "Creating…" : "Create routine"}
        </button>
      </form>

      {error ? <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">{error}</p> : null}
      {loading ? <p className="text-sm text-muted" role="status">Loading your routines…</p> : null}

      {!loading && !error && routines.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border-soft bg-surface px-6 py-12 text-center">
          <ListMusic className="mx-auto size-8 text-primary-400" aria-hidden="true" />
          <p className="mt-3 font-medium text-heading">No routines yet</p>
          <p className="mt-1 text-sm text-muted">Create one above, then add poses from any asana page or from the routine builder.</p>
        </div>
      ) : null}

      {routines.length > 0 ? (
        <ul className="space-y-2.5">
          {routines.map((routine) => (
            <li key={routine.id} className="flex items-center gap-2 rounded-2xl border border-border-soft bg-white p-2.5 shadow-sm sm:gap-3 sm:rounded-3xl sm:p-3">
              <Link href={`/dashboard/routines/${routine.id}`} className="group flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 sm:px-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 sm:size-11 sm:rounded-2xl"><ListMusic className="size-5" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-heading">{routine.name}</span>
                  <span className="mt-0.5 block text-xs text-muted">{routine.itemCount} {routine.itemCount === 1 ? "pose" : "poses"}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary-700" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => void remove(routine.id)}
                disabled={deletingId === routine.id}
                aria-label={`Delete ${routine.name}`}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
