import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Dumbbell,
  Info,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { CONTENT_TYPE_META, DIFFICULTY_META } from "@/lib/library/contentMeta";
import type { ContentDetail } from "@/lib/api/types";
import { GuidedPractice } from "@/components/guided/GuidedPractice";

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border-soft bg-surface p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-heading">
        <span className="text-primary-600" aria-hidden="true">
          {icon}
        </span>
        {title}
      </h2>
      <div className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted">
        {children}
      </div>
    </section>
  );
}

/**
 * Public asana/article/video detail (agents.md 2.1). Fully readable without
 * login. Long-form guidance fields render only when the admin provided them,
 * so we never show empty headings.
 */
export function ContentDetailView({ detail }: { detail: ContentDetail }) {
  const item = detail.summary;
  const type = CONTENT_TYPE_META[item.contentType];
  const difficulty = DIFFICULTY_META[item.difficulty];
  const TypeIcon = type.icon;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/yoga"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to the library
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
              type.chip,
            )}
          >
            <TypeIcon className="size-3.5" aria-hidden="true" />
            {type.label}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span className={cn("size-1.5 rounded-full", difficulty.dot)} aria-hidden="true" />
            {difficulty.label}
          </span>
          {item.durationMinutes ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Clock className="size-3.5" aria-hidden="true" />
              {item.durationMinutes} min
            </span>
          ) : null}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">
          {item.title}
        </h1>
        {item.sanskritName ? (
          <p className="mt-1 text-sm text-muted italic">{item.sanskritName}</p>
        ) : null}
        <p className="mt-4 text-base leading-relaxed text-muted">{item.summary}</p>
      </header>

      {item.featuredImageUrl ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border-soft">
          <img
            src={item.featuredImageUrl}
            alt=""
            className="aspect-[16/10] w-full object-cover"
          />
        </div>
      ) : null}

      {/* Guided slideshow with optional voice narration - rendered only when
          the admin published ordered steps. Public and login-free (agents.md
          2.1); speech runs entirely in the browser. */}
      {detail.steps.length > 0 ? (
        <div className="mt-6">
          <GuidedPractice steps={detail.steps} poseTitle={item.title} />
        </div>
      ) : null}

      {/* Target areas — small pills, not a full section. */}
      {detail.targetAreas.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {detail.targetAreas.map((area) => (
            <span
              key={area}
              className="rounded-full border border-border-soft bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800"
            >
              {area}
            </span>
          ))}
        </div>
      ) : null}

      {/* Categories + tags — linkable so browsing continues from here. */}
      {item.categories.length > 0 || item.tags.length > 0 ? (
        <div className="mt-6 space-y-3 border-t border-border-soft pt-6">
          {item.categories.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                Categories
              </span>
              {item.categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/yoga?category=${encodeURIComponent(c.slug)}`}
                  className="rounded-full border border-border-soft bg-surface px-2.5 py-1 text-xs font-medium text-heading underline-offset-2 hover:border-primary-300 hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          ) : null}
          {item.tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                Tags
              </span>
              {item.tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/yoga?tags=${encodeURIComponent(t.slug)}`}
                  className="rounded-full border border-border-soft bg-surface px-2.5 py-1 text-xs font-medium text-muted underline-offset-2 hover:border-primary-300 hover:text-primary-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Long-form guidance — each block renders only when the admin filled it,
          so we never show an empty heading (agents.md 2.1). */}
      <div className="mt-8 space-y-5">
        {detail.description ? (
          <Section icon={<Info className="size-5" />} title="About this practice">
            {detail.description}
          </Section>
        ) : null}

        {detail.instructions ? (
          <Section icon={<Dumbbell className="size-5" />} title="Step-by-step">
            {detail.instructions}
          </Section>
        ) : null}

        {detail.breathingNotes ? (
          <Section icon={<Sparkles className="size-5" />} title="Breathing">
            {detail.breathingNotes}
          </Section>
        ) : null}

        {detail.modifications ? (
          <Section icon={<Dumbbell className="size-5" />} title="Modifications">
            {detail.modifications}
          </Section>
        ) : null}

        {detail.benefits ? (
          <Section icon={<BadgeCheck className="size-5" />} title="Benefits">
            {detail.benefits}
          </Section>
        ) : null}

        {/* Safety always takes visual priority when present (agents.md 2.1). */}
        {detail.safetyPrecautions ? (
          <section className="rounded-2xl border border-danger/30 bg-danger/5 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-danger">
              <ShieldAlert className="size-5" aria-hidden="true" />
              Safety precautions
            </h2>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-heading">
              {detail.safetyPrecautions}
            </p>
          </section>
        ) : null}

        {/* Evidence is framed honestly — traditional use is distinct from
            scientific findings, and we make no medical claims (agents.md 2.14). */}
        {detail.evidenceNotes ? (
          <section className="rounded-2xl border border-dashed border-border-soft bg-primary-50/40 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-heading">
              <Info className="size-5 text-primary-600" aria-hidden="true" />
              Traditional &amp; evidence notes
            </h2>
            <div className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted">
              {detail.evidenceNotes}
            </div>
            <p className="mt-3 text-xs text-muted">
              This is educational information, not medical advice. Always consult a
              qualified professional before starting a new practice.
            </p>
          </section>
        ) : null}
      </div>
    </article>
  );
}
