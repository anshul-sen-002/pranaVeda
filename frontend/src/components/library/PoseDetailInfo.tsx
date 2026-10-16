"use client";
import { ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ContentSummary } from "@/lib/api/types";
import { SaveButton } from "@/components/library/SaveButton";
export function PoseDetailInfo(p: {
  item: ContentSummary;
  difficulty: { label: string; dot: string };
  steps: { title: string; body: string }[];
  tab: "instructions" | "benefits";
  setTab: (t: "instructions" | "benefits") => void;
  openStep: number;
  setOpenStep: (i: number) => void;
  breathing: string | null;
  safety: string | null;
  instructions: string | null;
  benefits: string | null;
}) {
  const { item, difficulty, steps, tab, setTab, openStep, setOpenStep } = p;
  return (
    <div className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">{item.title}</h1>
          {item.sanskritName ? <p className="mt-1 text-sm text-muted italic">{item.sanskritName}</p> : null}
        </div>
        <SaveButton targetType="CONTENT" targetId={item.id} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-1 font-medium text-primary-800">
          <span className={cn("size-1.5 rounded-full", difficulty.dot)} aria-hidden="true" /> {difficulty.label}
        </span>
        {item.durationMinutes ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 font-medium text-primary-800">
            <Clock className="size-3.5" aria-hidden="true" /> {item.durationMinutes} min
          </span>
        ) : null}
        {steps.length > 0 ? <span className="rounded-full bg-primary-50 px-2.5 py-1 font-medium text-primary-800">{steps.length} steps</span> : null}
      </div>
      {item.summary ? <p className="mt-4 text-sm leading-relaxed text-body sm:text-base">{item.summary}</p> : null}
      <div className="mt-5 border-b border-border-soft" role="tablist" aria-label="Pose details">
        {(["instructions", "benefits"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={cn("mr-6 border-b-2 pb-2 text-sm font-medium capitalize", tab === t ? "border-primary-500 text-heading" : "border-transparent text-muted hover:text-heading")}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "instructions" ? (
          steps.length > 0 ? (
            <ol className="space-y-2">
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
                        {i === 0 && p.breathing ? <p className="mt-2 text-xs text-body">Breathing: {p.breathing.split("\n")[0]}</p> : null}
                        {i === 0 && p.safety ? <p className="mt-1.5 text-xs text-body">Safety: {p.safety.split("\n")[0]}</p> : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          ) : p.instructions ? (
            <p className="rounded-xl border border-border-soft bg-surface p-4 text-sm leading-relaxed whitespace-pre-line text-body">{p.instructions}</p>
          ) : (
            <p className="rounded-xl bg-surface-tint p-4 text-sm text-muted">Step-by-step guidance is on its way for this pose.</p>
          )
        ) : p.benefits ? (
          <p className="rounded-xl border border-border-soft bg-surface p-4 text-sm leading-relaxed whitespace-pre-line text-body">{p.benefits}</p>
        ) : (
          <p className="rounded-xl bg-surface-tint p-4 text-sm text-muted">Benefits are being reviewed for this pose.</p>
        )}
      </div>
    </div>
  );
}
