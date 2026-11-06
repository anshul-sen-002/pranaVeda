"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronDown, Clock, Flower2, Leaf, ShieldAlert, Sparkles, Volume2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DIFFICULTY_META } from "@/lib/library/contentMeta";
import type { ContentDetail } from "@/lib/api/types";
import { LeafSprig } from "@/components/brand/Botanical";
import { SaveButton } from "@/components/library/SaveButton";
import { AddToRoutineButton } from "@/components/library/AddToRoutineButton";

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

/** Ask Cloudinary for a browser-friendly H.264 MP4 stream (notably for MOV uploads). */
function playableVideoUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "res.cloudinary.com") {
      parsed.pathname = parsed.pathname.replace("/video/upload/", "/video/upload/f_mp4,vc_h264/");
      return parsed.toString();
    }
  } catch {
    // Let the native player handle non-absolute URLs as-is.
  }
  return url;
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

export function PoseDetail({ detail }: { detail: ContentDetail }) {
  const item = detail.summary;
  const isVideo = item.contentType === "VIDEO";
  const videoUrl = playableVideoUrl(item.featuredVideoUrl);
  const difficulty = item.difficulty ? DIFFICULTY_META[item.difficulty] : null;
  const steps = splitSteps(detail.instructions);
  const gallery = [item.featuredImageUrl, ...detail.steps.map((s) => s.imageUrl)].filter((u): u is string => !!u).slice(0, 5);
  const [activeImg, setActiveImg] = useState(0);
  const [openStep, setOpenStep] = useState(0);
  return (
    <article className="mx-auto w-full min-w-0 max-w-6xl px-3 py-5 sm:px-8 sm:py-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-muted sm:mb-6">
        <Link href="/yoga" className="inline-flex min-h-9 items-center gap-1 font-medium text-primary-700 underline-offset-4 hover:underline">
          <ArrowLeft className="size-3.5" aria-hidden="true" /> Yoga Poses
        </Link>
        <span aria-hidden="true">›</span>
        <span className="truncate text-body">{item.title}</span>
      </nav>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,.9fr)]">
        {/* Left: hero image + thumbnails */}
        <div className="min-w-0">
          <div className={cn(
            "relative overflow-hidden rounded-2xl border border-border-soft",
            isVideo && videoUrl
              ? "h-[min(70svh,177.78vw)] w-full bg-[#17231c] shadow-[0_18px_48px_-30px_rgba(18,42,29,.5)] sm:aspect-video sm:h-auto"
              : "aspect-[3/2] bg-primary-50",
          )}>
            {!isVideo ? <LeafSprig className="pointer-events-none absolute bottom-2 left-2 h-24 w-16 text-primary-200" /> : null}
            {isVideo && videoUrl ? (
              <video
                src={videoUrl}
                poster={item.featuredImageUrl ?? undefined}
                controls
                preload="auto"
                playsInline
                loop
                aria-label={`${item.title} practice video`}
                className="h-full w-full object-contain"
              />
            ) : gallery[activeImg] ? (
              <img src={gallery[activeImg]} alt={`${item.title} demonstration`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-primary-300">
                <Leaf className="size-16" aria-hidden="true" />
              </div>
            )}
          </div>
          {gallery.length > 1 ? (
            <div className="scrollbar-none mt-2.5 flex gap-2 overflow-x-auto pb-0.5 sm:mt-3 sm:grid sm:grid-cols-5" aria-label="Pose images">
              {gallery.map((url, i) => (
                <button key={i} type="button" onClick={() => setActiveImg(i)} aria-pressed={activeImg === i} aria-label={`View image ${i + 1}`}
                  className={cn("aspect-[3/2] h-12 w-[4.5rem] shrink-0 overflow-hidden rounded-xl border-2 sm:h-auto sm:w-full", activeImg === i ? "border-primary-500" : "border-transparent opacity-70 hover:opacity-100")}>
                  <img src={url} alt="" aria-hidden="true" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}

        </div>

        {/* Right: title, sanskrit, badges, description */}
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              {isVideo ? <p className="mb-1 text-[10px] font-semibold tracking-[.14em] text-primary-700 uppercase">Video practice</p> : null}
              <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">{item.title}</h1>
              {item.sanskritName ? <p className="mt-1 text-sm text-muted italic">{item.sanskritName}</p> : null}
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              {item.contentType === "ASANA" ? <AddToRoutineButton contentId={item.id} contentTitle={item.title} /> : null}
              <SaveButton targetType="CONTENT" targetId={item.id} className="whitespace-nowrap" />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {difficulty ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-1 font-medium text-primary-800">
                <span className={cn("size-1.5 rounded-full", difficulty.dot)} aria-hidden="true" /> {difficulty.label}
              </span>
            ) : null}
            {item.durationMinutes ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 font-medium text-primary-800">
                <Clock className="size-3.5" aria-hidden="true" /> {item.durationMinutes} min
              </span>
            ) : null}
            {steps.length > 0 ? <span className="rounded-full bg-primary-50 px-2.5 py-1 font-medium text-primary-800">{steps.length} steps</span> : null}
          </div>
          {item.categories.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Categories">
              {item.categories.map((category) => (
                <Link key={category.id} href={`${isVideo ? "/videos" : "/yoga"}?category=${encodeURIComponent(category.slug)}`} className="rounded-full border border-border-soft bg-white px-2.5 py-1 text-xs font-medium text-primary-800 hover:border-primary-300 hover:text-primary-700">
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}
          {item.summary && !(isVideo && detail.description?.startsWith(item.summary)) ? <p className="mt-4 text-sm leading-relaxed text-body sm:text-base">{item.summary}</p> : null}
          {isVideo && detail.description ? (
            <section className="mt-4 rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-heading">About this video</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-body">{detail.description}</p>
            </section>
          ) : null}

          {/* Instructions accordion */}
          <div className="mt-6">
            <h2 className="flex items-center gap-2 text-base font-semibold text-heading">
              <Flower2 className="size-5 text-primary-600" aria-hidden="true" /> Instructions
            </h2>
            {steps.length > 0 ? (
              <ol className="mt-3 space-y-2">
                {steps.map((s, i) => {
                  const open = openStep === i;
                  return (
                    <li key={i} className="overflow-hidden rounded-xl border border-border-soft bg-surface">
                      <button type="button" onClick={() => setOpenStep(open ? -1 : i)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800">{i + 1}</span>
                        <span className="flex-1 text-sm font-semibold text-heading">{s.title}</span>
                        <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} aria-hidden="true" />
                      </button>
                      {open ? (
                        <div className="border-t border-border-soft px-4 py-3">
                          <p className="text-sm leading-relaxed whitespace-pre-line text-body">{s.body}</p>
                          {i === 0 && detail.breathingNotes ? (
                            <p className="mt-2 text-xs text-body flex items-start gap-1.5">
                              <Volume2 className="mt-0.5 size-3.5 shrink-0 text-primary-600" aria-hidden="true" />
                              Breathing: {detail.breathingNotes.split("\n")[0]}
                            </p>
                          ) : null}
                          {i === 0 && detail.safetyPrecautions ? (
                            <p className="mt-1.5 text-xs text-body flex items-start gap-1.5">
                              <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden="true" />
                              Safety: {detail.safetyPrecautions.split("\n")[0]}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-3 rounded-xl border border-border-soft bg-white p-4 text-sm text-body">Step-by-step guidance is on its way for this pose.</p>
            )}
          </div>
        </div>
      </div>
      {videoUrl && !isVideo ? (
        <section className="mt-6 rounded-3xl border border-border-soft bg-white p-3 shadow-[0_18px_48px_-38px_rgba(18,42,29,.4)] sm:mt-8 sm:p-5" aria-label="Guided practice video">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2 sm:mb-4">
            <div><h2 className="flex items-center gap-2 text-base font-semibold text-heading sm:text-lg"><Volume2 className="size-5 text-primary-700" aria-hidden="true" />Watch the practice</h2><p className="mt-1 text-xs text-body sm:text-sm">Press play to follow along with this pose.</p></div>
          </div>
          <video
            src={videoUrl}
            poster={item.featuredImageUrl ?? undefined}
            controls
            preload="auto"
            playsInline
            loop
            aria-label={`${item.title} guided practice video`}
            className="mx-auto h-[min(70svh,177.78vw)] w-full rounded-2xl border border-border-soft bg-[#17231c] object-contain sm:aspect-video sm:h-auto sm:max-h-[75vh]"
          >
            Your browser does not support the video element.
          </video>
        </section>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {detail.breathingNotes ? <Section icon={<Sparkles className="size-5" />} title="Breathing">{detail.breathingNotes}</Section> : null}
        {detail.modifications ? <Section icon={<ShieldAlert className="size-5" />} title="Modifications">{detail.modifications}</Section> : null}
        {detail.safetyPrecautions ? <Section icon={<ShieldAlert className="size-5" />} title="Safety precautions" tone="safety">{detail.safetyPrecautions}</Section> : null}
        {detail.evidenceNotes ? <Section icon={<Leaf className="size-5" />} title="Traditional & evidence notes" tone="evidence">{detail.evidenceNotes}</Section> : null}
      </div>
      <p className="mt-6 text-xs text-muted">Practicing? Stop anytime if something hurts.</p>
    </article>
  );
}

