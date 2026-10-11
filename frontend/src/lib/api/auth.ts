import { apiRequest } from "./client";
import type { LoginRequest, RegisterRequest, TokenResponse, UserSummary } from "./types";

/**
 * Auth endpoints.
 *
 * Note on refresh/logout: no body is sent. The refresh token is an HttpOnly
 * cookie the browser attaches automatically via `credentials: "include"`.
 */
export const authApi = {
  register(payload: RegisterRequest): Promise<TokenResponse> {
    return apiRequest<TokenResponse>("/api/v1/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  login(payload: LoginRequest): Promise<TokenResponse> {
    return apiRequest<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  /** Exchanges the refresh cookie for a new access token. 401 when not signed in. */
  refresh(): Promise<TokenResponse> {
    return apiRequest<TokenResponse>("/api/v1/auth/refresh", { method: "POST" });
  },

  /** Idempotent; always clears the session cookie server-side. */
  logout(): Promise<void> {
    return apiRequest<void>("/api/v1/auth/logout", { method: "POST" }) as Promise<void>;
  },

  me(accessToken: string): Promise<UserSummary> {
    return apiRequest<UserSummary>("/api/v1/auth/me", { accessToken });
  },
};
