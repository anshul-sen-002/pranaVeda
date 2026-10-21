"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, Play, Square } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";

/** Session-mode timer: guided countdown that records only on explicit finish. */
export function SessionTimer({ contentId, defaultMinutes, onDone }: { contentId?: number; defaultMinutes?: number; onDone?: () => void }) {
  const { accessToken } = useAuth();
  const [minutes, setMinutes] = useState(defaultMinutes ?? 10);
  const [left, setLeft] = useState((defaultMinutes ?? 10) * 60);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { setLeft(minutes * 60); }, [minutes]);
  useEffect(() => {
    if (!running) return;
    if (left <= 0) { setRunning(false); return; }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left]);
  const finish = async () => {
    if (!accessToken) { setMsg("Sign in to save this session."); return; }
    setSaving(true); setMsg(null);
    try {
      await meApi.recordSession(accessToken, { contentId, durationMinutes: minutes, notes: undefined });
      setMsg("Session saved to your history.");
      setRunning(false);
      onDone?.();
    } catch (err) { setMsg(err instanceof ApiError ? err.message : "Could not save session."); }
    finally { setSaving(false); }
  };
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <section aria-label="Session timer" className="rounded-3xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30 p-5 text-center">
      <p className="text-xs font-semibold tracking-widest text-primary-700 uppercase">Session mode</p>
      <p className="mt-1 text-4xl font-semibold text-heading tabular-nums" aria-live="polite">{mm}:{ss}</p>
      <div className="mt-3 flex justify-center gap-1.5">
        {[5, 10, 20, 30].map((m) => (
          <button key={m} type="button" onClick={() => setMinutes(m)} aria-pressed={minutes === m} className={`min-h-9 rounded-full px-3.5 text-xs font-medium ${minutes === m ? "bg-primary-600 text-white" : "bg-surface-tint text-body"}`}>{m}m</button>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {!running ? (
          <button type="button" onClick={() => setRunning(true)} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white"><Play className="size-4" aria-hidden="true" />Start</button>
        ) : (
          <button type="button" onClick={() => setRunning(false)} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary-600 px-5 text-sm font-semibold text-white"><Square className="size-4" aria-hidden="true" />Pause</button>
        )}
        <button type="button" onClick={() => void finish()} disabled={saving} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-success/40 bg-success/10 px-5 text-sm font-semibold text-success disabled:opacity-50">
          {saving ? "Saving…" : <><CheckCircle2 className="size-4" aria-hidden="true" />Finish &amp; save</>}
        </button>
      </div>
      {msg ? <p className="mt-2 text-xs text-muted" role="status">{msg}</p> : null}
      <p className="mt-2 text-[11px] text-muted">Completion records only when you tap Finish.</p>
    </section>
  );
}
