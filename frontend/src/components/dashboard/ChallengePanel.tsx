"use client";

import Link from "next/link";
import { ArrowRight, Award, Target } from "lucide-react";

import { ChallengeProgress } from "@/components/dashboard/ChallengeProgress";
import { JoinChallengeButton } from "@/components/dashboard/JoinChallengeButton";
import type { ChallengeProgressDto } from "@/lib/api/types";

/** Challenge panel: live progress or a gentle join prompt. */
export function ChallengePanel({ challenge, onChanged }: { challenge: ChallengeProgressDto | null; onChanged: () => void }) {
  return (
    <section aria-labelledby="challenge-heading" className="flex flex-col rounded-3xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30 p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
          <Award className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="challenge-heading" className="font-semibold text-heading">
            {challenge ? challenge.challengeTitle : "7-day yoga challenge"}
          </h2>
          <p className="text-xs text-muted">
            {challenge ? `${challenge.dailyGoalMinutes} min a day · gentle, never punishing` : "A gentle week of daily practice"}
          </p>
        </div>
      </div>
      {challenge ? (
        <ChallengeProgress challenge={challenge} onChanged={onChanged} />
      ) : (
        <div className="mt-5 flex flex-1 flex-col justify-center gap-3 text-center">
          <Target className="mx-auto size-8 text-primary-300" aria-hidden="true" />
          <p className="text-sm text-muted">
            Join the 7-day challenge and we&apos;ll track each day for you — missing a day
            simply means completing more days, never shame.
          </p>
          <JoinChallengeButton onJoined={onChanged} />
        </div>
      )}
    </section>
  );
}

/** Small "view all" link used by panel headers. */
export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline">
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}
