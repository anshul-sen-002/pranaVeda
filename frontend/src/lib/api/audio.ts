import { apiRequest } from "./client";
import type { AudioCategory, AudioDetailDto, AudioTrackSummary, PageResponse } from "./types";

export interface FavoriteStatus {
  trackId: number;
  favorite: boolean;
  count: number;
}

/**
 * Calm-music endpoints (agents.md 2.12). Public browsing and streaming are
 * login-free; favorites and listening history live under /api/v1/me/audio/**.
 */
export const audioApi = {
  /** Published track list, newest first. Public. */
  list(page = 0, size = 20): Promise<PageResponse<AudioTrackSummary>> {
    const sp = new URLSearchParams({ page: String(page), size: String(size) });
    return apiRequest<PageResponse<AudioTrackSummary>>(`/api/v1/audio?${sp}`);
  },

  /** Published tracks in a category, newest first. Public. */
  listByCategory(
    category: AudioCategory,
    page = 0,
    size = 20,
  ): Promise<PageResponse<AudioTrackSummary>> {
    const sp = new URLSearchParams({ page: String(page), size: String(size) });
    return apiRequest<PageResponse<AudioTrackSummary>>(
      `/api/v1/audio/category/${category}?${sp}`,
    );
  },

  /** A single published track by slug with its stream URL. Public — 404 otherwise. */
  bySlug(slug: string): Promise<AudioDetailDto> {
    return apiRequest<AudioDetailDto>(`/api/v1/audio/${encodeURIComponent(slug)}`);
  },

  /** Favorite toggle (add if absent, remove if present). Member only. */
  toggleFavorite(trackId: number, accessToken: string): Promise<FavoriteStatus> {
    return apiRequest<FavoriteStatus>(`/api/v1/me/audio/favorites/${trackId}`, {
      method: "POST",
      accessToken,
    });
  },

  /** Whether the caller has favorited a track. Member only. */
  favoriteStatus(
    trackId: number,
    accessToken: string,
  ): Promise<FavoriteStatus> {
    return apiRequest<FavoriteStatus>(`/api/v1/me/audio/favorites/${trackId}`, { accessToken });
  },

  /** Records that the caller played a track. Member only. */
  recordListen(trackId: number, secondsListened: number, accessToken: string): Promise<void> {
    return apiRequest<void>("/api/v1/me/audio/history", {
      method: "POST",
      accessToken,
      body: { trackId, secondsListened: Math.max(0, Math.floor(secondsListened)) },
    }) as Promise<void>;
  },
};
