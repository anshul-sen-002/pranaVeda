import type { AudioCategory } from "@/lib/api/types";

export const CATEGORY_LABEL: Record<AudioCategory, string> = {
  MEDITATION: "Meditation",
  NATURE: "Nature Sounds",
  SINGING_BOWLS: "Relaxation",
  SLEEP: "Sleep",
  FOCUS: "Focus",
  GUIDED_BREATHING: "Stress Relief",
};

export function minutesOf(t: { durationSeconds: number | null }): string {
  if (t.durationSeconds == null) return "—";
  return `${Math.round(t.durationSeconds / 60)} min`;
}
