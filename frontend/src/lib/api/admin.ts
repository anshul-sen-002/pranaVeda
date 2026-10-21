import { apiRequest } from "./client";
import type { ContentDetail, ContentStep, PageResponse, ContentSummary, MediaDto, AudioDetailDto } from "./types";

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

  /** Full update (used to set featuredImageUrl after a media upload). */
  update(accessToken: string, id: number | string, body: unknown): Promise<ContentDetail> {
    return apiRequest<ContentDetail>(`/api/v1/admin/content/${id}`, {
      method: "PUT",
      accessToken,
      body,
    });
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

  /** ADMIN: deletes the content item, its Cloudinary media, and member bookmarks. */
  remove(accessToken: string, id: number | string): Promise<void> {
    return apiRequest<void>(`/api/v1/admin/content/${id}`, {
      method: "DELETE",
      accessToken,
    }) as Promise<void>;
  },
};

/**
 * Admin media upload (Cloudinary pipeline). Client-side checks mirror the
 * backend limits (MediaProperties) so an over-limit file is rejected in the
 * browser before a wasted upload — the server always re-validates.
 */
export type MediaUploadKind = "CONTENT_IMAGE" | "VIDEO" | "AUDIO";

export const MEDIA_LIMITS: Record<MediaUploadKind, { maxBytes: number; accept: string }> = {
  CONTENT_IMAGE: { maxBytes: 5 * 1024 * 1024, accept: "image/jpeg,image/png,image/webp,image/avif" },
  VIDEO: { maxBytes: 100 * 1024 * 1024, accept: "video/mp4,video/webm,video/quicktime" },
  AUDIO: { maxBytes: 50 * 1024 * 1024, accept: "audio/mpeg,audio/mp4,audio/ogg,audio/wav" },
};

export const adminMediaApi = {
  /** Multipart upload → safe MediaDto (id + delivery URL + metadata). */
  upload(
    accessToken: string,
    file: File,
    kind: MediaUploadKind,
    contentId?: number | string,
  ): Promise<MediaDto> {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    if (contentId != null) form.append("contentId", String(contentId));
    return apiRequest<MediaDto>("/api/v1/admin/media", {
      method: "POST",
      accessToken,
      body: form,
      isFormData: true,
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

/**
 * Admin audio-studio endpoints (agents.md 2.12). Upload audio/cover files via
 * `adminMediaApi.upload` first (kind AUDIO / CONTENT_IMAGE), then attach the
 * returned asset id here. Publication is an explicit server-checked action.
 */
export const adminAudioApi = {
  list(accessToken: string): Promise<PageResponse<AudioDetailDto>> {
    return apiRequest<PageResponse<AudioDetailDto>>("/api/v1/admin/audio", { accessToken });
  },

  create(accessToken: string, body: unknown): Promise<AudioDetailDto> {
    return apiRequest<AudioDetailDto>("/api/v1/admin/audio", { method: "POST", accessToken, body });
  },

  get(accessToken: string, id: number | string): Promise<AudioDetailDto> {
    return apiRequest<AudioDetailDto>(`/api/v1/admin/audio/${id}`, { accessToken });
  },

  update(accessToken: string, id: number | string, body: unknown): Promise<AudioDetailDto> {
    return apiRequest<AudioDetailDto>(`/api/v1/admin/audio/${id}`, { method: "PUT", accessToken, body });
  },

  /** Attach an uploaded AUDIO media asset as this track's stream source. */
  attachAudio(accessToken: string, id: number | string, assetId: number): Promise<AudioDetailDto> {
    return apiRequest<AudioDetailDto>(`/api/v1/admin/audio/${id}/audio-asset?assetId=${assetId}`, {
      method: "POST",
      accessToken,
    });
  },

  /** Attach an uploaded CONTENT_IMAGE asset as this track's cover art. */
  attachCover(accessToken: string, id: number | string, assetId: number): Promise<AudioDetailDto> {
    return apiRequest<AudioDetailDto>(`/api/v1/admin/audio/${id}/cover-asset?assetId=${assetId}`, {
      method: "POST",
      accessToken,
    });
  },

  publish(accessToken: string, id: number | string): Promise<AudioDetailDto> {
    return apiRequest<AudioDetailDto>(`/api/v1/admin/audio/${id}/publish`, { method: "POST", accessToken });
  },

  unpublish(accessToken: string, id: number | string): Promise<AudioDetailDto> {
    return apiRequest<AudioDetailDto>(`/api/v1/admin/audio/${id}/unpublish`, { method: "POST", accessToken });
  },

  archive(accessToken: string, id: number | string): Promise<AudioDetailDto> {
    return apiRequest<AudioDetailDto>(`/api/v1/admin/audio/${id}/archive`, { method: "POST", accessToken });
  },

  /** ADMIN: deletes the track, its Cloudinary media, and member references. */
  remove(accessToken: string, id: number | string): Promise<void> {
    return apiRequest<void>(`/api/v1/admin/audio/${id}`, { method: "DELETE", accessToken }) as Promise<void>;
  },
};
