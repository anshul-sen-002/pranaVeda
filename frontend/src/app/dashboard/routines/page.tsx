"use client";

import { useCallback, useEffect, useState } from "react";
import { ListMusic, Plus, Trash2 } from "lucide-react";

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
  const [routines, setRoutines] = useState<RoutineSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

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

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !name.trim()) return;
    setCreating(true);
    try {
      await meApi.createRoutine(accessToken, { name: name.trim(), contentIds: [] });
      setName("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create routine.");
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id: number) => {
    if (!accessToken) return;
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    try {
      await meApi.deleteRoutine(accessToken, id);
    } catch {
      void load();
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="My routines" subtitle="Build and reuse your own pose sequences." />
      <form onSubmit={create} className="flex flex-wrap items-end gap-3 rounded-3xl border border-border-soft bg-surface p-4">
        <label className="min-w-56 flex-1">
          <span className="mb-1.5 block text-sm font-medium text-heading">Routine name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wind-down stretch"
            className="h-11 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm text-heading focus:border-primary-300 focus:ring-2 focus:ring-primary-200 focus:outline-none"
          />
        </label>
        <button type="submit" disabled={creating || !name.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white disabled:opacity-50">
          <Plus className="size-4" aria-hidden="true" />
          {creating ? "Creating…" : "Create"}
        </button>
      </form>
      {error ? <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">{error}</p> : null}
      {loading ? <p className="text-sm text-muted">Loading…</p> : null}
      {!loading && routines.length === 0 ? (
        <div className="rounded-3xl border border-border-soft bg-surface px-6 py-12 text-center">
          <ListMusic className="mx-auto size-8 text-primary-300" aria-hidden="true" />
          <p className="mt-3 font-medium text-heading">No routines yet</p>
          <p className="mt-1 text-sm text-muted">Create one above, then add poses from any practice.</p>
        </div>
      ) : null}
      {routines.length > 0 ? (
        <ul className="divide-y divide-border-soft rounded-3xl border border-border-soft bg-surface">
          {routines.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-heading">{r.name}</p>
                <p className="text-xs text-muted">{r.itemCount} pose{r.itemCount === 1 ? "" : "s"}{r.isPublic ? " · public" : ""}</p>
              </div>
              <button type="button" onClick={() => void remove(r.id)} aria-label={`Delete ${r.name}`} className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/10 hover:text-danger">
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
