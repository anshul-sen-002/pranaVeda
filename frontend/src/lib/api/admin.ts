import { apiRequest } from "./client";
import type { ContentDetail, ContentStep, PageResponse, ContentSummary } from "./types";

/**
 * Admin content-studio endpoints (agents.md 2.15). Every call needs the
 * in-memory access token; the backend re-checks `hasRole("ADMIN")` on
 * `/api/v1/admin/**` regardless of what the UI shows.
 */
export const adminContentApi = {
  list(
    accessToken: string,
    params: { q?: string; status?: string; page?: number; size?: number } = {},
  ): Promise<PageResponse<ContentSummary>> {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status) sp.set("status", params.status);
    sp.set("page", String(params.page ?? 0));
    sp.set("size", String(params.size ?? 20));
    return apiRequest<PageResponse<ContentSummary>>(`/api/v1/admin/content?${sp}`, { accessToken });
  },

  create(accessToken: string, body: unknown): Promise<ContentDetail> {
    return apiRequest<ContentDetail>("/api/v1/admin/content", {
      method: "POST",
      accessToken,
      body,
    });
  },

  get(accessToken: string, id: number | string): Promise<ContentDetail> {
    return apiRequest<ContentDetail>(`/api/v1/admin/content/${id}`, { accessToken });
  },

  publish(accessToken: string, id: number | string): Promise<ContentDetail> {
    return apiRequest<ContentDetail>(`/api/v1/admin/content/${id}/publish`, {
      method: "POST",
      accessToken,
    });
  },

  unpublish(accessToken: string, id: number | string): Promise<ContentDetail> {
    return apiRequest<ContentDetail>(`/api/v1/admin/content/${id}/unpublish`, {
      method: "POST",
      accessToken,
    });
  },
};

/** Admin endpoints for ordered guided steps (guided pose + voice narration). */
export const adminStepApi = {
  list(accessToken: string, contentId: number | string): Promise<ContentStep[]> {
    return apiRequest<ContentStep[]>(`/api/v1/admin/content/${contentId}/steps`, { accessToken });
  },

  /** Multipart upload through the secure Cloudinary pipeline. */
  add(
    accessToken: string,
    contentId: number | string,
    file: File,
    caption: string,
    instruction?: string,
  ): Promise<ContentStep> {
    const form = new FormData();
    form.append("file", file);
    if (caption) form.append("caption", caption);
    if (instruction) form.append("instruction", instruction);
    return apiRequest<ContentStep>(`/api/v1/admin/content/${contentId}/steps`, {
      method: "POST",
      accessToken,
      body: form,
      isFormData: true,
    });
  },

  update(
    accessToken: string,
    contentId: number | string,
    stepId: number,
    body: { caption?: string; instruction?: string },
  ): Promise<ContentStep> {
    return apiRequest<ContentStep>(`/api/v1/admin/content/${contentId}/steps/${stepId}`, {
      method: "PUT",
      accessToken,
      body,
    });
  },

  reorder(
    accessToken: string,
    contentId: number | string,
    stepIds: number[],
  ): Promise<ContentStep[]> {
    return apiRequest<ContentStep[]>(`/api/v1/admin/content/${contentId}/steps/reorder`, {
      method: "PUT",
      accessToken,
      body: { stepIds },
    });
  },

  /** AI narration drafts via the OpenRouter Agent API (server-side key). */
  generate(
    accessToken: string,
    contentId: number | string,
    body: { stepIds?: number[]; overwrite?: boolean } = {},
  ): Promise<ContentStep[]> {
    return apiRequest<ContentStep[]>(
      `/api/v1/admin/content/${contentId}/steps/generate-instructions`,
      { method: "POST", accessToken, body },
    );
  },

  remove(accessToken: string, contentId: number | string, stepId: number): Promise<void> {
    return apiRequest<void>(`/api/v1/admin/content/${contentId}/steps/${stepId}`, {
      method: "DELETE",
      accessToken,
    }) as Promise<void>;
  },
};
