"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuthedFetch } from "@/hooks/useAuthedFetch";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/cn";

/** Small "quick log" form under Recent sessions (1–1440 minutes). */
export function LogSessionInline({ onLogged }: { onLogged: () => void }) {
  const run = useAuthedFetch();
  const [minutes, setMinutes] = useState("20");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(minutes);
    if (!Number.isFinite(value) || value < 1 || value > 1440) {
      setIsError(true);
      setFeedback("Enter 1–1440 minutes.");
      return;
    }
    setPending(true);
    setFeedback(null);
    setIsError(false);
    try {
      await run((token) => meApi.recordSession(token, { durationMinutes: Math.round(value) }));
      setFeedback("Session logged. Every minute counts.");
      onLogged();
    } catch (err) {
      setIsError(true);
      setFeedback(err instanceof ApiError ? err.message : "Could not log the session.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 border-t border-border-soft pt-4">
      <label htmlFor="quick-log" className="text-xs font-semibold tracking-wide text-muted uppercase">
        Quick log
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="quick-log"
          inputMode="numeric"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Minutes"
          aria-describedby={feedback ? "quick-log-feedback" : undefined}
          className="h-11 w-full min-w-0 rounded-xl border border-border-soft bg-surface px-3.5 text-sm text-heading placeholder:text-muted focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-gradient-primary px-5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Log
        </button>
      </div>
      {feedback ? (
        <p id="quick-log-feedback" role={isError ? "alert" : "status"} className={cn("mt-2 text-xs", isError ? "text-danger" : "text-success")}>
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
