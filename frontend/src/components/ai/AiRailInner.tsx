"use client";

import { LotusMark } from "@/components/brand/LotusMark";

/** Right rail: gradient banner (screenshot, right column top). */
export function AiRailBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#dfe9dc] bg-gradient-gourd-white p-5 text-heading shadow-[0_14px_40px_-34px_rgba(29,63,46,.38)] sm:p-6">
      <LotusMark className="pointer-events-none absolute -right-7 -bottom-9 size-36 text-primary-300/45" />
      <h2 className="max-w-[12rem] text-lg leading-snug font-semibold sm:text-xl">Wellness, Reimagined with AI</h2>
      <p className="mt-2 max-w-[16rem] text-[13px] leading-relaxed text-body">
        Explore yoga, meditation, breathing, and gentle everyday wellness habits.
      </p>
    </div>
  );
}

/** Right rail: calm quote card (screenshot, right column bottom). */
export function AiRailQuote() {
  return (
      <div className="relative overflow-hidden rounded-3xl border border-[#dfe9dc] bg-gradient-gourd-white p-5">
      <LotusMark className="size-9 text-primary-400" />
      <p className="mt-3 max-w-[11rem] text-[15px] leading-snug font-medium text-heading">
        Small steps every day lead to big changes.
      </p>
      <span className="mt-3 block h-0.5 w-6 rounded bg-primary-300" aria-hidden="true" />
      <LotusMark className="pointer-events-none absolute -right-8 -bottom-10 size-40 text-primary-300/60" />
    </div>
  );
}
