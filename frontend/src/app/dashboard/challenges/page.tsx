"use client";

import { useCallback, useEffect, useState } from "react";
import { Award, Trophy } from "lucide-react";

import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";
import type { ChallengeDto, ChallengeProgressDto } from "@/lib/api/types";

export default function ChallengesPage() {
  return (
    <MemberGuard>
      <DashboardShell>
        <ChallengesView />
      </DashboardShell>
    </MemberGuard>
  );
}

function ChallengesView() {
  const { accessToken } = useAuth();
  const [joined, setJoined] = useState<ChallengeProgressDto[]>([]);
  const [available, setAvailable] = useState<ChallengeDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const [mine, published] = await Promise.all([
        meApi.myChallenges(accessToken),
        meApi.publishedChallenges().catch(() => [] as ChallengeDto[]),
      ]);
      setJoined(mine);
      setAvailable(published.filter((p) => !mine.some((m) => m.challengeId === p.id)));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load challenges.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const join = async (id: number) => {
    if (!accessToken) return;
    try {
      await meApi.joinChallenge(accessToken, id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not join challenge.");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Challenges" subtitle="Gentle, optional goals — missing a day never resets your worth." />
      {error ? <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">{error}</p> : null}
      {loading ? <p className="text-sm text-muted">Loading…</p> : null}

      {joined.length > 0 ? (
        <section aria-label="Joined challenges" className="space-y-3">
          {joined.map((c) => {
            const pct = Math.round((c.completedDays / c.durationDays) * 100);
            return (
              <article key={c.participationId} className="rounded-3xl border border-border-soft bg-surface p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                    <Award className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-heading">{c.challengeTitle}</h2>
                    <p className="text-xs text-muted">{c.dailyGoalMinutes} min a day · {c.completedDays} of {c.durationDays} days</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-100" aria-hidden="true">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
                </div>
                {c.badges.length > 0 ? (
                  <p className="mt-2 text-xs text-success">Badges: {c.badges.join(", ")}</p>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : null}

      {!loading && joined.length === 0 && available.length === 0 ? (
        <div className="rounded-3xl border border-border-soft bg-surface px-6 py-12 text-center">
          <Trophy className="mx-auto size-8 text-primary-300" aria-hidden="true" />
          <p className="mt-3 font-medium text-heading">No challenges yet</p>
          <p className="mt-1 text-sm text-muted">Publish a challenge from the admin studio to see it here.</p>
        </div>
      ) : null}

      {available.length > 0 ? (
        <section aria-label="Available challenges" className="space-y-3">
          {available.map((c) => (
            <article key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border-soft bg-surface p-5">
              <div className="min-w-0">
                <h2 className="font-semibold text-heading">{c.title}</h2>
                <p className="text-xs text-muted">{c.durationDays} days · {c.dailyGoalMinutes} min a day</p>
                {c.summary ? <p className="mt-1 text-sm text-body">{c.summary}</p> : null}
              </div>
              <button type="button" onClick={() => void join(c.id)} className="inline-flex min-h-11 items-center rounded-full bg-primary-600 px-5 text-sm font-semibold text-white">
                Join
              </button>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
