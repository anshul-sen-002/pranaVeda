"use client";

import { LotusMark } from "@/components/brand/LotusMark";

/** Right rail: gradient banner + calm quote (screenshot, right column). */
export function AiRail() {
  return (
    <div className="grid content-start gap-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-5 text-white sm:p-6">
        <LotusMark className="pointer-events-none absolute -right-7 -bottom-9 size-36 text-white/25" />
        <h2 className="max-w-[12rem] text-lg leading-snug font-semibold sm:text-xl">Wellness, Reimagined with AI</h2>
        <p className="mt-2 max-w-[16rem] text-[13px] leading-relaxed text-primary-50/90">
          Ask anything about yoga, meditation, health, routines, or get personalized wellness guidance.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border-soft bg-gradient-to-b from-primary-50/70 via-surface to-primary-100/60 p-5">
        <LotusMark className="size-9 text-primary-400" />
        <p className="mt-3 max-w-[11rem] text-[15px] leading-snug font-medium text-heading">
          Small steps every day lead to big changes.
        </p>
        <span className="mt-3 block h-0.5 w-6 rounded bg-primary-300" aria-hidden="true" />
        <LotusMark className="pointer-events-none absolute -right-8 -bottom-10 size-40 text-primary-300/60" />
      </div>
    </div>
  );
}
