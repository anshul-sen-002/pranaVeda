import { apiRequest } from "./client";
import type {
  BookmarkTarget,
  ContentType,
  DashboardPageDto,
  PageResponse,
  PracticeSessionDto,
  PracticeSessionRequest,
  RoutineDto,
  RoutineRequest,
  RoutineSummaryDto,
  SavedItemDto,
  StreakDto,
  WellnessProfileDto,
  WellnessProfileRequest,
} from "./types";

/**
 * Member endpoints under `/api/v1/me/**` (agents.md 2.6, 2.8, 2.9).
 * Every call needs the in-memory access token; the backend re-resolves the
 * owner from the security context so a user only ever sees their own data.
 */
export const meApi = {
  /** Full dashboard payload in one request (backend Redis cache, five minutes). */
  dashboard(accessToken: string): Promise<DashboardPageDto> {
    return apiRequest<DashboardPageDto>("/api/v1/me/dashboard", { accessToken });
  },

  /** Practice history, newest first, paginated (used for Recent Sessions). */
  sessions(accessToken: string, page = 0, size = 5): Promise<PageResponse<PracticeSessionDto>> {
    const sp = new URLSearchParams({ page: String(page), size: String(size) });
    return apiRequest<PageResponse<PracticeSessionDto>>(
      `/api/v1/me/practice-sessions?${sp}`,
      { accessToken },
    );
  },

  /** Records a completed practice — the explicit "finish session" action. */
  recordSession(accessToken: string, body: PracticeSessionRequest): Promise<PracticeSessionDto> {
    return apiRequest<PracticeSessionDto>("/api/v1/me/practice-sessions", {
      method: "POST",
      accessToken,
      body,
    });
  },

  /** The caller's current streak snapshot (server-computed). */
  streak(accessToken: string): Promise<StreakDto> {
    return apiRequest<StreakDto>("/api/v1/me/streaks", { accessToken });
  },

  /** The caller's wellness profile (personal info card, BMI disclaimer). */
  wellnessProfile(accessToken: string): Promise<WellnessProfileDto> {
    return apiRequest<WellnessProfileDto>("/api/v1/me/wellness-profile", {
      accessToken,
    });
  },

  /** Create or fully update the caller's wellness profile (all fields optional). */
  saveWellnessProfile(accessToken: string, body: WellnessProfileRequest): Promise<WellnessProfileDto> {
    return apiRequest<WellnessProfileDto>("/api/v1/me/wellness-profile", {
      method: "PUT",
      accessToken,
      body,
    });
  },

  /** Saved Library page with optional filters and sorting. */
  bookmarks(
    accessToken: string,
    params: { targetType?: BookmarkTarget; contentType?: ContentType; sort?: string; page?: number; size?: number } = {},
  ): Promise<PageResponse<SavedItemDto>> {
    const sp = new URLSearchParams();
    if (params.targetType) sp.set("targetType", params.targetType);
    if (params.contentType) sp.set("contentType", params.contentType);
    sp.set("sort", params.sort ?? "newest");
    sp.set("page", String(params.page ?? 0));
    sp.set("size", String(params.size ?? 20));
    return apiRequest<PageResponse<SavedItemDto>>(`/api/v1/me/bookmarks?${sp}`, { accessToken });
  },

  /** Saves an item. Idempotent — re-saving returns the existing bookmark. */
  saveBookmark(accessToken: string, targetType: BookmarkTarget, targetId: number): Promise<SavedItemDto> {
    return apiRequest<SavedItemDto>("/api/v1/me/bookmarks", {
      method: "POST",
      accessToken,
      body: { targetType, targetId },
    });
  },

  /** Removes a saved item. Idempotent — removing an absent item is a no-op. */
  removeBookmark(accessToken: string, targetType: BookmarkTarget, targetId: number): Promise<void> {
    return apiRequest<void>(
      `/api/v1/me/bookmarks/${targetType}/${targetId}`,
      { method: "DELETE", accessToken },
    ) as Promise<void>;
  },

  /** The caller's routines (summaries), most-recently-updated first. */
  routines(accessToken: string): Promise<RoutineSummaryDto[]> {
    return apiRequest<RoutineSummaryDto[]>("/api/v1/me/routines", { accessToken });
  },

  /** Creates a routine from an ordered sequence of published content ids. */
  createRoutine(accessToken: string, body: RoutineRequest): Promise<RoutineDto> {
    return apiRequest<RoutineDto>("/api/v1/me/routines", {
      method: "POST",
      accessToken,
      body,
    });
  },

  /** One of the caller's routines with its full ordered sequence. */
  routine(accessToken: string, id: number): Promise<RoutineDto> {
    return apiRequest<RoutineDto>(`/api/v1/me/routines/${id}`, { accessToken });
  },

  /** Renames/edits a routine and replaces its ordered sequence. */
  updateRoutine(accessToken: string, id: number, body: RoutineRequest): Promise<RoutineDto> {
    return apiRequest<RoutineDto>(`/api/v1/me/routines/${id}`, {
      method: "PUT",
      accessToken,
      body,
    });
  },

  /** Deletes one of the caller's routines. */
  deleteRoutine(accessToken: string, id: number): Promise<void> {
    return apiRequest<void>(`/api/v1/me/routines/${id}`, {
      method: "DELETE",
      accessToken,
    }) as Promise<void>;
  },

  /** The caller's current profile photo URL (404 when unset). */
  profilePhoto(accessToken: string): Promise<{ url: string | null }> {
    return apiRequest<{ url: string | null }>("/api/v1/me/profile-photo", { accessToken });
  },

  /** Replaces (or sets) the caller's profile photo. Images only, 5 MB max client-side. */
  setProfilePhoto(accessToken: string, file: File): Promise<{ url: string | null }> {
    const form = new FormData();
    form.append("file", file);
    return apiRequest<{ url: string | null }>("/api/v1/me/profile-photo", {
      method: "POST",
      accessToken,
      body: form,
      isFormData: true,
    });
  },

  /** Removes the caller's profile photo. Idempotent. */
  clearProfilePhoto(accessToken: string): Promise<void> {
    return apiRequest<void>("/api/v1/me/profile-photo", {
      method: "DELETE",
      accessToken,
    }) as Promise<void>;
  },
};
