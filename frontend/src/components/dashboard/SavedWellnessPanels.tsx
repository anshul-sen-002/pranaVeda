"use client";

import Link from "next/link";
import { Bookmark, Flower2, MoonStar, Sparkles } from "lucide-react";

import { PanelLink } from "@/components/dashboard/ChallengePanel";
import { titleCase } from "@/components/dashboard/dashboardUi";
import { CONTENT_TYPE_META } from "@/lib/library/contentMeta";
import type { DashboardDto, RoutineSummaryDto, WellnessProfileDto } from "@/lib/api/types";

/** Recently-saved preview with graceful handling of unavailable items. */
export function SavedPanel({ dashboard }: { dashboard: DashboardDto }) {
  return (
    <section aria-labelledby="saved-heading" className="rounded-3xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30 p-6">
      <div className="flex items-center justify-between">
        <h2 id="saved-heading" className="flex items-center gap-2 font-semibold text-heading">
          <Bookmark className="size-5 text-primary-600" aria-hidden="true" />
          Recently saved
        </h2>
        <PanelLink href="/dashboard/saved">Open library</PanelLink>
      </div>
      {dashboard.recentSaved.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Nothing saved yet. Tap the bookmark on any practice to keep it here.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {dashboard.recentSaved.slice(0, 4).map((item) => (
            <li key={`${item.targetType}-${item.targetId}`}>
              {item.available && item.content ? (
                <Link href={`/yoga/${item.content.slug}`} className="flex items-center gap-3 rounded-2xl border border-border-soft p-3 transition-colors hover:border-primary-200 hover:bg-primary-50/50">
                  {item.content.featuredImageUrl ? (
                    <img src={item.content.featuredImageUrl} alt="" loading="lazy" className="size-11 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                      <Flower2 className="size-5" aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-heading">{item.content.title}</span>
                    <span className="text-xs text-muted">{CONTENT_TYPE_META[item.content.contentType]?.label ?? item.contentType}</span>
                  </span>
                </Link>
              ) : (
                <div className="rounded-2xl border border-dashed border-border-soft p-3 text-sm text-muted">
                  A saved item is no longer available.
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Wellness snapshot + routine shortcuts. */
export function WellnessPanel({ wellness, routines }: { wellness: WellnessProfileDto | null; routines: RoutineSummaryDto[] }) {
  return (
    <section aria-labelledby="wellness-heading" className="rounded-3xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30 p-6">
      <div className="flex items-center justify-between">
        <h2 id="wellness-heading" className="flex items-center gap-2 font-semibold text-heading">
          <Sparkles className="size-5 text-primary-600" aria-hidden="true" />
          Wellness snapshot
        </h2>
        <PanelLink href="/dashboard/wellness">{wellness ? "View profile" : "Set up"}</PanelLink>
      </div>
      {!wellness ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-primary-50 p-4">
          <MoonStar className="mt-0.5 size-5 shrink-0 text-primary-600" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-body">
            Tell us a little about your goals and rhythm — everything is optional and stays
            private. It helps us suggest gentler starting points.
          </p>
        </div>
      ) : (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Fact label="Experience" value={wellness.experienceLevel ? titleCase(wellness.experienceLevel) : "—"} />
          <Fact label="Preferred session" value={wellness.preferredSessionMinutes ? `${wellness.preferredSessionMinutes} min` : "—"} />
          <Fact label="Practice time" value={wellness.practiceTime ? titleCase(wellness.practiceTime) : "—"} />
          <Fact label="Sleep quality" value={wellness.sleepQuality ? `${wellness.sleepQuality} / 5` : "—"} />
        </dl>
      )}
      {routines.length > 0 ? (
        <div className="mt-5 border-t border-border-soft pt-4">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Your routines</p>
          <ul className="mt-2 space-y-2">
            {routines.slice(0, 3).map((r) => (
              <li key={r.id}>
                <Link href="/dashboard/routines" className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-primary-50">
                  <span className="truncate font-medium text-heading">{r.name}</span>
                  <span className="shrink-0 text-xs text-muted">{r.itemCount} poses</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-tint px-3.5 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-heading">{value}</dd>
    </div>
  );
}
