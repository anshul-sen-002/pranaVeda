/**
 * Shared API types mirroring the Spring Boot DTOs.
 * Kept in one place so every feature imports from `@/lib/api/types`.
 */

export type Role = "USER" | "ADMIN";

/** `GET /api/v1/auth/me` and the user block of token responses. */
export interface UserSummary {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
}

/** `POST /api/v1/auth/register` and `POST /api/v1/auth/login`. */
export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * The backend's uniform error envelope (agents.md 8).
 * `code` is a machine-readable enum; `message` is safe to show to users.
 */
export interface ApiErrorBody {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

/* ------------------------------------------------------------------ */
/* Content library (mirrors backend content/category DTOs)            */
/* ------------------------------------------------------------------ */

export type ContentType = "ASANA" | "ARTICLE" | "VIDEO";
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type SortKey = "newest" | "oldest" | "title_asc" | "duration_asc";

export interface CategoryDto {
  id: number;
  slug: string;
  name: string;
  description: string | null;
}

export interface TagDto {
  id: number;
  slug: string;
  name: string;
}

/** Card-level projection used by the public list (backend ContentSummary). */
export interface ContentSummary {
  id: number;
  slug: string;
  title: string;
  summary: string;
  contentType: ContentType;
  difficulty: Difficulty;
  durationMinutes: number | null;
  commonName: string | null;
  sanskritName: string | null;
  featuredImageUrl: string | null;
  status: ContentStatus;
  categories: CategoryDto[];
  tags: TagDto[];
  goals: string[];
  publishedAt: string | null;
}

/** Full detail projection (backend ContentDetail). */
export interface ContentDetail {
  summary: ContentSummary;
  description: string | null;
  instructions: string | null;
  breathingNotes: string | null;
  modifications: string | null;
  safetyPrecautions: string | null;
  benefits: string | null;
  evidenceNotes: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  targetAreas: string[];
  /** Ordered guided-slideshow steps; empty when the pose has none. */
  steps: ContentStep[];
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  updatedBy: number | null;
}

/** Who authored a step's narration text (backend InstructionSource). */
export type InstructionSource = "AI" | "ADMIN";

/** One ordered image + narration step of a guided pose (backend ContentStepDto). */
export interface ContentStep {
  id: number;
  stepOrder: number;
  imageUrl: string;
  caption: string | null;
  /** Null until an admin writes or generates it; publish requires it. */
  instruction: string | null;
  instructionSource: InstructionSource | null;
  updatedAt: string;
}

/** Uniform pagination payload (backend PageResponse<T>). */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Query parameters for GET /api/v1/content. */
export interface ContentListParams {
  q?: string;
  type?: ContentType;
  difficulty?: Difficulty;
  goal?: string;
  category?: string;
  tags?: string[];
  durationMax?: number;
  sort?: SortKey;
  page?: number;
  size?: number;
}

/* ------------------------------------------------------------------ */
/* Member dashboard (mirrors backend dashboard/streak/session/        */
/* bookmark/challenge/wellness DTOs). Backend is the source of truth  */
/* for streaks and totals — the frontend only renders them.           */
/* ------------------------------------------------------------------ */

export type BookmarkTarget = "CONTENT" | "AUDIO";
export type HeightUnit = "CM" | "IN";
export type WeightUnit = "KG" | "LB";
export type PracticeTime = "MORNING" | "AFTERNOON" | "EVENING" | "FLEXIBLE";

/** Server-computed streak snapshot (backend StreakDto). */
export interface StreakDto {
  currentStreak: number;
  longestStreak: number;
  practisedToday: boolean;
  practisedYesterday: boolean;
  broken: boolean;
  timezone: string;
  today: string;
}

/** Aggregate practice totals (backend PracticeStatsDto). */
export interface PracticeStatsDto {
  totalSessions: number;
  totalMinutes: number;
  sessionsLast7Days: number;
  minutesLast7Days: number;
  sessionsLast30Days: number;
  minutesLast30Days: number;
}

/** One recorded practice session (backend PracticeSessionDto). */
export interface PracticeSessionDto {
  id: number;
  contentId: number | null;
  content: ContentSummary | null;
  durationMinutes: number;
  completedAt: string;
  notes: string | null;
  createdAt: string;
}

export interface PracticeSessionRequest {
  contentId?: number;
  durationMinutes: number;
  completedAt?: string;
  notes?: string;
}

/** One Saved Library entry (backend SavedItemDto). */
export interface SavedItemDto {
  targetType: BookmarkTarget;
  targetId: number;
  contentType: ContentType | null;
  savedAt: string;
  available: boolean;
  content: ContentSummary | null;
}

/** A member's progress in a joined challenge (backend ChallengeProgressDto). */
export interface ChallengeProgressDto {
  participationId: number;
  challengeId: number;
  challengeTitle: string;
  challengeSlug: string;
  completedDays: number;
  durationDays: number;
  dailyGoalMinutes: number;
  completed: boolean;
  startedAt: string;
  practiceDates: string[];
  badges: string[];
}

/** Public challenge definition (backend ChallengeDto). */
export interface ChallengeDto {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  durationDays: number;
  dailyGoalMinutes: number;
}

/** One payload for the member dashboard (backend DashboardDto). */
export interface DashboardDto {
  streak: StreakDto;
  practice: PracticeStatsDto;
  savedCount: number;
  challenges: ChallengeProgressDto[];
  recentSaved: SavedItemDto[];
}

/** Safe view of a wellness profile (backend WellnessProfileDto). */
export interface WellnessProfileDto {
  id: number | null;
  dateOfBirth: string | null;
  age: number | null;
  heightValue: number | null;
  heightUnit: HeightUnit | null;
  weightValue: number | null;
  weightUnit: WeightUnit | null;
  experienceLevel: Difficulty | null;
  preferredSessionMinutes: number | null;
  practiceTime: PracticeTime | null;
  timezone: string | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  moodScore: number | null;
  flexibilityScore: number | null;
  constraintsNotes: string | null;
  aiPersonalizationConsent: boolean;
  bmiOrNull: number | null;
  bmiAvailable: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/** BMI disclaimer the backend requires us to render whenever BMI is shown. */
export const BMI_DISCLAIMER =
  "BMI is a limited screening metric based only on height and weight. It does not " +
  "account for muscle mass, body composition, age, or fitness, is not a measure of " +
  "overall health, and is never a diagnosis.";

/* ------------------------------------------------------------------ */
/* Routines (mirrors backend RoutineDto / RoutineSummaryDto)          */
/* ------------------------------------------------------------------ */

export interface RoutineItemDto {
  id: number;
  contentId: number;
  position: number;
  content: ContentSummary | null;
}

export interface RoutineDto {
  id: number;
  name: string;
  description: string | null;
  isPublic: boolean;
  items: RoutineItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutineSummaryDto {
  id: number;
  name: string;
  description: string | null;
  isPublic: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  contentIds: number[];
}
