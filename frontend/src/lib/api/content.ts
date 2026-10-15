import { apiRequest } from "./client";
import type {
  CategoryDto,
  ContentDetail,
  ContentListParams,
  ContentSummary,
  PageResponse,
  TagDto,
} from "./types";

/** Build the query string for GET /api/v1/content. Tags are sent as one comma list. */
export function buildContentQuery(params: ContentListParams): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.type) sp.set("type", params.type);
  if (params.difficulty) sp.set("difficulty", params.difficulty);
  if (params.goal) sp.set("goal", params.goal);
  if (params.category) sp.set("category", params.category);
  if (params.tags && params.tags.length > 0) sp.set("tags", params.tags.join(","));
  if (params.durationMax) sp.set("durationMax", String(params.durationMax));
  if (params.sort) sp.set("sort", params.sort);
  sp.set("page", String(params.page ?? 0));
  sp.set("size", String(params.size ?? 12));
  return sp.toString();
}

/** Public, no-auth content list (agents.md 2.1). Works on server and client. */
export function listContent(params: ContentListParams, signal?: AbortSignal) {
  return apiRequest<PageResponse<ContentSummary>>(
    `/api/v1/content?${buildContentQuery(params)}`,
    { signal },
  );
}

export function getContent(slug: string, signal?: AbortSignal) {
  return apiRequest<ContentDetail>(`/api/v1/content/${encodeURIComponent(slug)}`, { signal });
}

export function listCategories(signal?: AbortSignal) {
  return apiRequest<CategoryDto[]>("/api/v1/categories", { signal });
}

export function listTags(signal?: AbortSignal) {
  return apiRequest<TagDto[]>("/api/v1/tags", { signal });
}
