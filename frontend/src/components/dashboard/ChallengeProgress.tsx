"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Alert } from "@/components/ui/Alert";
import { DotLoader } from "@/components/motion/DotLoader";
import { useAuthedFetch } from "@/hooks/useAuthedFetch";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import type { ChallengeProgressDto } from "@/lib/api/types";
import { isTodayLocal } from "@/lib/dashboard/dates";

/** Progress bar, day dots, badges, and the idempotent "log today" action. */
export function ChallengeProgress({
  challenge,
  onChanged,
}: {
  challenge: ChallengeProgressDto;
  onChanged: () => void;
}) {
  const run = useAuthedFetch();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const pct = Math.min(100, Math.round((challenge.completedDays / challenge.durationDays) * 100));
  const completedToday = isTodayLocal(challenge.practiceDates);

  const completeToday = async () => {
    setPending(true);
    setFeedback(null);
    setOk(false);
    try {
      await run((t) => meApi.completeChallengeDay(t, challenge.challengeId, challenge.dailyGoalMinutes));
      setOk(true);
      setFeedback("Today marked complete. Gently done.");
      onChanged();
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : "Could not save today.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mt-5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-heading">
          Day {Math.min(challenge.completedDays + (completedToday ? 0 : 1), challenge.durationDays)}{" "}
          of {challenge.durationDays}
        </span>
        <span className="text-muted">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${challenge.challengeTitle} progress`}
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-primary-100"
      >
        <div
          className="h-full rounded-full bg-gradient-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-label="Completed days">
        {Array.from({ length: challenge.durationDays }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn("size-3 rounded-full", i < challenge.completedDays ? "bg-success" : "bg-border-soft")}
          />
        ))}
        <span className="sr-only">
          {challenge.completedDays} of {challenge.durationDays} days complete
        </span>
      </div>
      {challenge.badges.length > 0 ? (
        <p className="mt-3 flex flex-wrap gap-1.5">
          {challenge.badges.map((b) => (
            <span key={b} className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
              {b}
            </span>
          ))}
        </p>
      ) : null}
      <div className="mt-5" aria-live="polite">
        {feedback ? <Alert tone={ok ? "success" : "error"}>{feedback}</Alert> : null}
      </div>
      <button
        type="button"
        disabled={pending || completedToday || challenge.completed}
        onClick={() => void completeToday()}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? (
          <DotLoader inline size="sm" />
        ) : (
          <CheckCircle2 className="size-4" aria-hidden="true" />
        )}
        {challenge.completed
          ? "Challenge complete"
          : completedToday
            ? "Today already logged"
            : `Log today (${challenge.dailyGoalMinutes} min)`}
      </button>
    </div>
  );
}
