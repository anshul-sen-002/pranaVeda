"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck2, IdCard } from "lucide-react";

/** Small pill linking to the full detail page (screenshot: "View Routine Details"). */
export function DetailLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary-300 bg-surface px-4 py-2 text-[13px] font-medium text-primary-700 transition-colors hover:bg-primary-50"
    >
      <IdCard className="size-4" aria-hidden="true" />
      {label}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

/** Friendly empty-state nudge shown under the AI greeting (screenshot copy). */
export function RoutineNudge() {
  return (
    <div className="rounded-2xl rounded-bl-md bg-primary-50/70 px-4 py-3 text-sm leading-relaxed text-body">
      <p>
        Great! I&apos;ll share the step-by-step guide with images for your 15-minute sleep yoga
        routine. <span role="img" aria-label="moon">🌙</span>
      </p>
      <DetailLink href="/dashboard/routines" label="View Routine Details" />
    </div>
  );
}

/** Reminder strip shown when the visitor has no AI history yet. */
export function HistoryNudge() {
  return (
    <Link
      href="/ai/history"
      className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface px-4 py-3 text-left transition-colors hover:border-primary-300"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-100/70 text-primary-700">
        <CalendarCheck2 className="size-4.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-heading">Past conversations live here</span>
        <span className="block truncate text-xs text-muted">Open your AI history any time</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-primary-500" aria-hidden="true" />
    </Link>
  );
}
