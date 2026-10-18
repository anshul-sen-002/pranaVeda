"use client";
import { useEffect, useState } from "react";
import { History, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { audioMemberApi, type ListenHistoryDto } from "@/lib/api/extras";
import { ApiError } from "@/lib/api/client";

function clock(s: number) {
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

/** Member listening history (private, deletable). */
export function ListeningHistory() {
  const { status, accessToken } = useAuth();
  const [items, setItems] = useState<ListenHistoryDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    if (!accessToken) return;
    try {
      const page = await audioMemberApi.history(accessToken, 0, 20);
      setItems(page.content); setError(null);
    } catch (err) { setError(err instanceof ApiError ? err.message : "Could not load history."); }
  };
  useEffect(() => { if (status === "authenticated") void load(); }, [status]);
  if (status !== "authenticated") return null;
  const clear = async () => {
    if (!accessToken) return;
    try { await audioMemberApi.clearHistory(accessToken); setItems([]); }
    catch { /* noop */ }
  };
  return (
    <section aria-label="Listening history" className="rounded-3xl border border-border-soft bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-heading"><History className="size-4 text-primary-600" aria-hidden="true" />Listening history</h2>
        {items.length > 0 ? <button type="button" onClick={() => void clear()} className="inline-flex items-center gap-1 text-xs text-muted hover:text-danger"><Trash2 className="size-3.5" aria-hidden="true" />Clear</button> : null}
      </div>
      {error ? <p className="mt-2 text-xs text-danger" role="alert">{error}</p> : null}
      {items.length === 0 ? <p className="mt-2 text-sm text-muted">Tracks you play while signed in appear here.</p> : (
        <ul className="mt-3 space-y-1.5">
          {items.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-heading">{h.trackTitle}</span>
              <span className="shrink-0 text-xs text-muted">{clock(h.secondsListened)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
