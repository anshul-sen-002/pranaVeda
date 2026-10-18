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
    <section aria-label="Weekly consistency" className="rounded-3xl border border-border-soft bg-surface p-5">
      <h2 className="text-sm font-semibold text-heading">This week · {total} min</h2>
      <div className="mt-3 flex items-end gap-2" role="img" aria-label={`Minutes per day: ${days.map((d, i) => `${d} ${mins[i]}`).join(", ")}`}>
        {mins.map((m, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-20 w-full items-end rounded-lg bg-primary-50">
              <div className="w-full rounded-lg bg-primary-500" style={{ height: `${Math.max(4, (m / max) * 100)}%`, opacity: m ? 1 : 0.25 }} />
            </div>
            <span className="text-[10px] text-muted">{days[i]}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">{total === 0 ? "No practice logged this week yet — every day counts." : `${sessions.length} recent sessions charted.`}</p>
    </section>
  );
}
