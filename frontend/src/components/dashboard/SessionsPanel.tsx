"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, History } from "lucide-react";

import { LogSessionInline } from "@/components/dashboard/LogSessionInline";
import { PanelLink } from "@/components/dashboard/ChallengePanel";
import { formatDate } from "@/components/dashboard/dashboardUi";
import type { PracticeSessionDto } from "@/lib/api/types";

/** Recent practice history + inline quick-log form. */
export function SessionsPanel({ sessions, onLogged }: { sessions: PracticeSessionDto[]; onLogged: () => void }) {
  return (
    <section aria-labelledby="sessions-heading" className="flex flex-col rounded-3xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
            <History className="size-5" aria-hidden="true" />
          </span>
          <h2 id="sessions-heading" className="font-semibold text-heading">Recent sessions</h2>
        </div>
        <PanelLink href="/dashboard/history">View all</PanelLink>
      </div>
      {sessions.length === 0 ? (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <Clock3 className="size-8 text-primary-300" aria-hidden="true" />
          <p className="text-sm font-medium text-heading">No sessions yet</p>
          <p className="max-w-xs text-sm text-muted">Sessions appear here when you finish a practice.</p>
          <Link href="/yoga" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full border border-border-soft px-5 text-sm font-medium text-primary-700 hover:border-primary-300 hover:bg-primary-50">
            Browse yoga
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border-soft">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-heading">{s.content?.title ?? "General practice"}</p>
                <p className="text-xs text-muted">{formatDate(s.completedAt)} · {s.durationMinutes} min</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                Done
              </span>
            </li>
          ))}
        </ul>
      )}
      <LogSessionInline onLogged={onLogged} />
    </section>
  );
}
