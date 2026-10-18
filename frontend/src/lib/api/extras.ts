import { apiRequest } from "./client";
import type { PageResponse } from "./types";

export interface MediaDownloadDto {
  url: string;
  filename: string;
  contentType: string;
  bytes: number | null;
}

export const mediaApi = {
  download(accessToken: string, mediaId: number): Promise<MediaDownloadDto> {
    return apiRequest<MediaDownloadDto>(`/api/v1/me/media/${mediaId}/download`, { accessToken });
  },
};

export interface ListenHistoryDto {
  id: number;
  trackId: number;
  trackTitle: string;
  secondsListened: number;
  listenedAt: string;
}

export const audioMemberApi = {
  favorites(accessToken: string, page = 0, size = 20) {
    const sp = new URLSearchParams({ page: String(page), size: String(size) });
    return apiRequest<PageResponse<import("./types").AudioTrackSummary>>(`/api/v1/me/audio/favorites?${sp}`, { accessToken });
  },
  history(accessToken: string, page = 0, size = 20): Promise<PageResponse<ListenHistoryDto>> {
    const sp = new URLSearchParams({ page: String(page), size: String(size) });
    return apiRequest<PageResponse<ListenHistoryDto>>(`/api/v1/me/audio/history?${sp}`, { accessToken });
  },
  clearHistory(accessToken: string): Promise<void> {
    return apiRequest<void>("/api/v1/me/audio/history", { method: "DELETE", accessToken }) as Promise<void>;
  },
};

export const aiHistoryApi = {
  list(accessToken: string): Promise<import("./ai").AiConversationSummary[]> {
    return apiRequest<import("./ai").AiConversationSummary[]>("/api/v1/ai/conversations", { accessToken });
  },
  get(accessToken: string, id: number): Promise<import("./ai").AiChatResponse> {
    return apiRequest<import("./ai").AiChatResponse>(`/api/v1/ai/conversations/${id}`, { accessToken });
  },
  remove(accessToken: string, id: number): Promise<void> {
    return apiRequest<void>(`/api/v1/ai/conversations/${id}`, { method: "DELETE", accessToken }) as Promise<void>;
  },
};

export const taxonomyAdminApi = {
  createCategory(accessToken: string, body: { name: string; slug?: string; description?: string }) {
    return apiRequest<import("./types").CategoryDto>("/api/v1/admin/categories", { method: "POST", accessToken, body });
  },
  updateCategory(accessToken: string, id: number, body: { name: string; slug?: string; description?: string }) {
    return apiRequest<import("./types").CategoryDto>(`/api/v1/admin/categories/${id}`, { method: "PUT", accessToken, body });
  },
  createTag(accessToken: string, body: { name: string; slug?: string }) {
    return apiRequest<import("./types").TagDto>("/api/v1/admin/tags", { method: "POST", accessToken, body });
  },
  updateTag(accessToken: string, id: number, body: { name: string; slug?: string }) {
    return apiRequest<import("./types").TagDto>(`/api/v1/admin/tags/${id}`, { method: "PUT", accessToken, body });
  },
};
