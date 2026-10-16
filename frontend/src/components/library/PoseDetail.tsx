"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Leaf, ShieldAlert, Sparkles, Heart } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DIFFICULTY_META } from "@/lib/library/contentMeta";
import type { ContentDetail } from "@/lib/api/types";
import { LeafSprig } from "@/components/brand/Botanical";
import { PoseDetailInfo } from "@/components/library/PoseDetailInfo";

function splitSteps(text: string | null): { title: string; body: string }[] {
  if (!text?.trim()) return [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const steps: { title: string; body: string }[] = [];
  for (const line of lines) {
    const m = line.match(/^(?:step\s*)?(\d+)[).:–-]\s*(.+)$/i);
    if (m) steps.push({ title: `Step ${m[1]}`, body: m[2] });
    else if (steps.length > 0) steps[steps.length - 1].body += `\n${line}`;
    else steps.push({ title: "Step 1", body: line });
  }
  return steps.slice(0, 12);
}

function Section({ icon, title, children, tone }: { icon: ReactNode; title: string; children: ReactNode; tone?: "safety" | "evidence" }) {
  return (
    <section className={cn(
      "rounded-2xl border p-5 sm:p-6",
      tone === "safety" ? "border-danger/30 bg-danger/5" : tone === "evidence" ? "border-dashed border-border-soft bg-primary-50/40" : "border-border-soft bg-surface",
    )}>
      <h2 className={cn("flex items-center gap-2 text-base font-semibold", tone === "safety" ? "text-danger" : "text-heading")}>
        <span className={tone === "safety" ? "" : "text-primary-600"} aria-hidden="true">{icon}</span>
        {title}
      </h2>
      <div className={cn("mt-3 text-sm leading-relaxed whitespace-pre-line", tone === "safety" ? "text-heading" : "text-muted")}>{children}</div>
    </section>
  );
}

/** Mockup 4: breadcrumb, gallery left, title/meta/tabs right. */
export function PoseDetail({ detail }: { detail: ContentDetail }) {
  const item = detail.summary;
  const difficulty = DIFFICULTY_META[item.difficulty];
  const steps = splitSteps(detail.instructions);
  const gallery = [item.featuredImageUrl, ...detail.steps.map((s) => s.imageUrl)].filter((u): u is string => !!u).slice(0, 5);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState<"instructions" | "benefits">("instructions");
  const [openStep, setOpenStep] = useState(0);
  return (
    <article className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted">
        <Link href="/yoga" className="inline-flex items-center gap-1 font-medium text-primary-700 underline-offset-4 hover:underline">
          <ArrowLeft className="size-3.5" aria-hidden="true" /> Yoga Poses
        </Link>
        <span aria-hidden="true">›</span>
        <span className="truncate text-body">{item.title}</span>
      </nav>
      <div className="mt-5 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="min-w-0">
          <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-primary-50">
            <LeafSprig className="pointer-events-none absolute bottom-2 left-2 h-24 w-16 text-primary-200" />
            {gallery[activeImg] ? (
              <img src={gallery[activeImg]} alt={`${item.title} demonstration`} className="relative aspect-[4/5] w-full object-cover sm:aspect-square" />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center text-primary-300 sm:aspect-square">
                <Leaf className="size-14" aria-hidden="true" />
              </div>
            )}
          </div>
          {gallery.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-2" aria-label="Pose images">
              {gallery.slice(0, 4).map((url, i) => (
                <button key={i} type="button" onClick={() => setActiveImg(i)} aria-pressed={activeImg === i} aria-label={`View image ${i + 1}`}
                  className={cn("overflow-hidden rounded-xl border-2", activeImg === i ? "border-primary-500" : "border-transparent opacity-70 hover:opacity-100")}>
                  <img src={url} alt="" aria-hidden="true" className="aspect-square w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <PoseDetailInfo item={item} difficulty={difficulty} steps={steps} tab={tab} setTab={setTab} openStep={openStep} setOpenStep={setOpenStep} breathing={detail.breathingNotes} safety={detail.safetyPrecautions} instructions={detail.instructions} benefits={detail.benefits} />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {detail.breathingNotes ? <Section icon={<Sparkles className="size-5" />} title="Breathing">{detail.breathingNotes}</Section> : null}
        {detail.modifications ? <Section icon={<Heart className="size-5" />} title="Modifications">{detail.modifications}</Section> : null}
        {detail.safetyPrecautions ? <Section icon={<ShieldAlert className="size-5" />} title="Safety precautions" tone="safety">{detail.safetyPrecautions}</Section> : null}
        {detail.evidenceNotes ? <Section icon={<Leaf className="size-5" />} title="Traditional & evidence notes" tone="evidence">{detail.evidenceNotes}</Section> : null}
      </div>
      <p className="mt-6 text-xs text-muted">Practicing? Stop anytime if something hurts.</p>
    </article>
  );
}
