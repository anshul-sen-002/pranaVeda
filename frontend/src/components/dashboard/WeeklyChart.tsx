"use client";
import type { PracticeSessionDto } from "@/lib/api/types";

/** Weekly consistency bars from server-provided sessions (labels + text summary). */
export function WeeklyChart({ sessions }: { sessions: PracticeSessionDto[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const mins = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  for (const s of sessions) {
    const d = new Date(s.completedAt);
    const diff = Math.floor((d.getTime() - monday.getTime()) / 86_400_000);
    if (diff >= 0 && diff < 7) mins[diff] += s.durationMinutes;
  }
  const max = Math.max(1, ...mins);
  const total = mins.reduce((a, b) => a + b, 0);
  return (
    <section aria-label="Weekly consistency" className="rounded-2xl border border-border-soft bg-gradient-to-br from-white via-primary-50/25 to-primary-100/25 p-4 sm:rounded-3xl sm:p-5">
      <div className="flex items-baseline justify-between gap-3"><h2 className="text-sm font-semibold text-heading">Weekly practice</h2><span className="text-xs font-medium text-primary-800">{total} min</span></div>
      <div className="mt-4 flex items-end gap-1.5 sm:gap-2" role="img" aria-label={`Minutes per day: ${days.map((d, i) => `${d} ${mins[i]}`).join(", ")}`}>
        {mins.map((m, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-16 w-full items-end overflow-hidden rounded-md bg-primary-50 sm:h-24 sm:rounded-lg">
              <div className="w-full rounded-md bg-primary-500 transition-[height] duration-300 sm:rounded-lg" style={{ height: `${Math.max(4, (m / max) * 100)}%`, opacity: m ? 1 : 0.22 }} />
            </div>
            <span className="text-[9px] font-medium text-muted sm:text-[10px]">{days[i]}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">{total === 0 ? "No practice logged this week yet — every day counts." : `${sessions.length} recent sessions charted.`}</p>
    </section>
  );
}
