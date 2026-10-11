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
