import type { ContentListParams, ContentType, Difficulty, SortKey } from "@/lib/api/types";

/**
 * Filter option metadata + URL <-> ContentListParams parsing.
 * The option values match the backend enums exactly so we never send a value
 * the API would reject (agents.md 2.5).
 */

export const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "ASANA", label: "Asana" },
  { value: "ARTICLE", label: "Article" },
  { value: "VIDEO", label: "Video" },
];

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

/** Goal values are the backend apiValue() strings (lowercase). */
export const GOALS: { value: string; label: string }[] = [
  { value: "flexibility", label: "Flexibility" },
  { value: "relaxation", label: "Relaxation" },
  { value: "balance", label: "Balance" },
  { value: "mobility", label: "Mobility" },
  { value: "posture", label: "Posture" },
  { value: "sleep_routine", label: "Sleep routine" },
  { value: "general_fitness", label: "General fitness" },
];

export const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "duration_asc", label: "Shortest first" },
];

export const DURATIONS: { value: number; label: string }[] = [
  { value: 10, label: "Up to 10 min" },
  { value: 20, label: "Up to 20 min" },
  { value: 30, label: "Up to 30 min" },
  { value: 45, label: "Up to 45 min" },
  { value: 60, label: "Up to 60 min" },
];

const TYPE_SET = new Set<string>(CONTENT_TYPES.map((t) => t.value));
const DIFF_SET = new Set<string>(DIFFICULTIES.map((d) => d.value));
const GOAL_SET = new Set<string>(GOALS.map((g) => g.value));
const SORT_SET = new Set<string>(SORTS.map((s) => s.value));

/** Read validated filter state from a URLSearchParams (unknown values are dropped). */
export function parseParams(usp: URLSearchParams): ContentListParams {
  const type = usp.get("type");
  const difficulty = usp.get("difficulty");
  const goal = usp.get("goal");
  const sort = usp.get("sort");
  const duration = usp.get("durationMax");
  const rawPage = Number(usp.get("page"));

  return {
    q: usp.get("q")?.trim() || undefined,
    type: type && TYPE_SET.has(type) ? (type as ContentType) : undefined,
    difficulty:
      difficulty && DIFF_SET.has(difficulty) ? (difficulty as Difficulty) : undefined,
    goal: goal && GOAL_SET.has(goal) ? goal : undefined,
    category: usp.get("category")?.trim() || undefined,
    tags: usp.get("tags")?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
    durationMax: duration && Number.isFinite(Number(duration)) ? Number(duration) : undefined,
    sort: sort && SORT_SET.has(sort) ? (sort as SortKey) : "newest",
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 0,
    size: 12,
  };
}

/** True when any filter/search/sort (or a non-first page) is active. */
export function hasActiveFilters(p: ContentListParams): boolean {
  return Boolean(
    p.q ||
      p.type ||
      p.difficulty ||
      p.goal ||
      p.category ||
      (p.tags && p.tags.length > 0) ||
      p.durationMax ||
      (p.sort && p.sort !== "newest") ||
      (p.page && p.page > 0),
  );
}

/** Serialize filter state back to a URLSearchParams for the address bar. */
export function toSearchParams(p: ContentListParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  if (p.type) sp.set("type", p.type);
  if (p.difficulty) sp.set("difficulty", p.difficulty);
  if (p.goal) sp.set("goal", p.goal);
  if (p.category) sp.set("category", p.category);
  if (p.tags && p.tags.length > 0) sp.set("tags", p.tags.join(","));
  if (p.durationMax) sp.set("durationMax", String(p.durationMax));
  if (p.sort) sp.set("sort", p.sort);
  if (p.page && p.page > 0) sp.set("page", String(p.page));
  return sp;
}

