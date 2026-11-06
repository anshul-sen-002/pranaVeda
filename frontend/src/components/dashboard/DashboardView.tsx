"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, CalendarCheck2, Flame, Timer } from "lucide-react";

import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SavedPanel, WellnessPanel } from "@/components/dashboard/SavedWellnessPanels";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { SessionsPanel } from "@/components/dashboard/SessionsPanel";
import { DashboardError, StatCard } from "@/components/dashboard/dashboardUi";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";
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
export function DashboardView({ showWelcome = false }: { showWelcome?: boolean }) {
  return (
    <MemberGuard>
      <DashboardShell>
        <DashboardBody showWelcome={showWelcome} />
      </DashboardShell>
    </MemberGuard>
  );
}

function DashboardBody({ showWelcome }: { showWelcome: boolean }) {
  const { user } = useAuth();
  const router = useRouter();
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

  useEffect(() => {
    if (showWelcome && (data || error)) {
      router.replace("/dashboard", { scroll: false });
    }
  }, [showWelcome, data, error, router]);

  if (!data && !error) {
    return showWelcome
      ? <LoadingOverlay title="Preparing your dashboard" description="Gathering your practice, saved items, and weekly progress." />
      : <DashboardLoadingSkeleton />;
  }
  if (error && !data) return <DashboardError message={error} onRetry={() => setReloadKey((k) => k + 1)} />;

  const { dashboard, sessions, wellness, routines } = data!;
  const streak = dashboard.streak;
  const practice = dashboard.practice;
  const refresh = () => setReloadKey((k) => k + 1);
  const firstName = user?.displayName?.trim().split(/\s+/)[0];

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-4 sm:space-y-6">
      <DashboardHero firstName={firstName} practisedToday={streak.practisedToday} />
      <DashboardSearch />
      <section aria-label="Practice overview" className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
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
    <div className="space-y-4 sm:space-y-5">
      <SessionsPanel sessions={sessions} onLogged={refresh} />
      <WeeklyChart sessions={sessions} />
      <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-2">
        <SavedPanel dashboard={dashboard} />
        <WellnessPanel wellness={wellness} routines={routines} />
      </div>
    </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="mx-auto w-full max-w-7xl animate-pulse space-y-4 sm:space-y-6">
      <span className="sr-only">Loading dashboard</span>
      <div className="h-36 rounded-3xl bg-primary-50 sm:h-44" />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-24 rounded-2xl border border-border-soft bg-white sm:h-28" />)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="h-48 rounded-2xl border border-border-soft bg-white" />
        <div className="h-48 rounded-2xl border border-border-soft bg-white" />
      </div>
    </div>
  );
}
