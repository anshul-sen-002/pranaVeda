"use client";

import { Apple, CalendarCheck2, ChevronRight, Leaf, Sun, Wind } from "lucide-react";

export const SUGGESTIONS = [
  { icon: Leaf, label: "Best yoga for stress relief" },
  { icon: Sun, label: "Morning routine for more energy" },
  { icon: Wind, label: "Breathing exercises for anxiety" },
  { icon: Apple, label: "Healthy diet tips for better focus" },
  { icon: CalendarCheck2, label: "How to stay consistent with yoga" },
] as const;

/** "Quick Suggestions" rail card (screenshot, right column). */
export function QuickSuggestions({ onPick }: { onPick: (label: string) => void }) {
  return (
    <section aria-label="Quick suggestions" className="rounded-3xl border border-border-soft bg-surface p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-[15px] font-semibold text-heading">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4.5 text-primary-500">
          <path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2zm7 11l.9 2.6 2.6.9-2.6.9L19 20l-.9-2.6-2.6-.9 2.6-.9L19 13z" />
        </svg>
        Quick Suggestions
      </h2>
      <ul className="mt-3 space-y-2">
        {SUGGESTIONS.map((s) => (
          <li key={s.label}>
            <button
              type="button"
              onClick={() => onPick(s.label)}
              className="group flex w-full items-center gap-3 rounded-2xl bg-surface-tint/60 px-3 py-2.5 text-left transition-colors hover:bg-primary-50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-100/70 text-primary-700">
                <s.icon className="size-4.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-body group-hover:text-heading">{s.label}</span>
              <ChevronRight className="size-4 shrink-0 text-primary-500" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
