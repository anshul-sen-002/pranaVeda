"use client";

import { useEffect, useState } from "react";
import { Bookmark, CalendarCheck2, Flame, Timer } from "lucide-react";

import { MemberGuard } from "@/components/auth/MemberGuard";
import { ChallengePanel } from "@/components/dashboard/ChallengePanel";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SavedPanel, WellnessPanel } from "@/components/dashboard/SavedWellnessPanels";
import { SessionsPanel } from "@/components/dashboard/SessionsPanel";
import { DashboardError, DashboardSkeleton, StatCard } from "@/components/dashboard/dashboardUi";
import { useAuth } from "@/hooks/useAuth";
import { useAuthedFetch } from "@/hooks/useAuthedFetch";
import { meApi } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";
import type { DashboardDto, PracticeSessionDto, RoutineSummaryDto, WellnessProfileDto } from "@/lib/api/types";

interface DashboardData {
  dashboard: DashboardDto;
  sessions: PracticeSessionDto[];
  wellness: WellnessProfileDto | null;
  routines: RoutineSummaryDto[];
}

/** Member overview (agents.md 2.9). Server figures only — never derived here. */
export function DashboardView() {
  return (
    <MemberGuard>
      <DashboardShell>
        <DashboardBody />
      </DashboardShell>
    </MemberGuard>
  );
}

function DashboardBody() {
  const { user } = useAuth();
  const run = useAuthedFetch();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // The effect body only subscribes — state resets happen inside the promise
  // callbacks so the react-hooks/set-state-in-effect rule stays quiet.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      run((token) => meApi.dashboard(token)),
      run((token) => meApi.sessions(token, 0, 5)),
      run((token) => meApi.wellnessProfile(token)).catch((err: unknown) =>
        err instanceof ApiError && err.status === 404 ? null : Promise.reject(err),
      ),
      run((token) => meApi.routines(token)).catch(() => [] as RoutineSummaryDto[]),
    ]).then(
      ([dashboard, sessionPage, wellness, routines]) => {
        if (cancelled) return;
        setError(null);
        setData({ dashboard, sessions: sessionPage.content, wellness, routines });
      },
      (err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Could not load your dashboard.");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [run, reloadKey]);

  if (!data && !error) return <DashboardSkeleton />;
  if (error && !data) return <DashboardError message={error} onRetry={() => setReloadKey((k) => k + 1)} />;

  const { dashboard, sessions, wellness, routines } = data!;
  const streak = dashboard.streak;
  const practice = dashboard.practice;
  const refresh = () => setReloadKey((k) => k + 1);
  const firstName = user?.displayName?.trim().split(/\s+/)[0];

  return (
    <div className="space-y-6">
      <DashboardHero firstName={firstName} practisedToday={streak.practisedToday} />
      <section aria-label="Practice overview" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Flame className="size-5" aria-hidden="true" />}
          value={String(streak.currentStreak)}
          label={streak.currentStreak === 1 ? "day streak" : "day streak"}
          hint={streak.practisedToday ? "Logged for today" : streak.practisedYesterday ? "Practise today to keep it going" : streak.broken ? "A fresh start — every day counts" : `Best ${streak.longestStreak}`}
        />
        <StatCard icon={<Timer className="size-5" aria-hidden="true" />} value={String(practice.minutesLast7Days)} label="minutes this week" hint={`${practice.totalMinutes} total`} />
        <StatCard icon={<CalendarCheck2 className="size-5" aria-hidden="true" />} value={String(practice.sessionsLast7Days)} label="sessions this week" hint={`${practice.totalSessions} total`} />
        <StatCard icon={<Bookmark className="size-5" aria-hidden="true" />} value={String(dashboard.savedCount)} label="saved practices" hint="Your library" href="/dashboard/saved" />
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChallengePanel challenge={dashboard.challenges[0] ?? null} onChanged={refresh} />
        <SessionsPanel sessions={sessions} onLogged={refresh} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SavedPanel dashboard={dashboard} />
        <WellnessPanel wellness={wellness} routines={routines} />
      </div>
    </div>
  );
}
