import type { ApiErrorBody, FieldError } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * Error thrown for any non-2xx API response.
 * Carries the parsed backend envelope so forms can render field errors.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldError[];
  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null, fallbackMessage: string) {
    super(body?.message || fallbackMessage);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code ?? "UNKNOWN";
    this.fieldErrors = body?.fieldErrors ?? [];
    this.body = body;
  }

  /** True when the access token was missing/expired (safe to retry after refresh). */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

/** Non-2xx responses are rejected as ApiError; 204 resolves to null. */
async function parse<T>(response: Response): Promise<T | null> {
  if (response.status === 204) return null;

  const text = await response.text();
  let body: ApiErrorBody | null = null;
  if (text) {
    try {
      body = JSON.parse(text) as ApiErrorBody;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, body, `Request failed with ${response.status}`);
  }
  return body as unknown as T;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Bearer access token held in memory by the auth provider. */
  accessToken?: string | null;
  body?: unknown;
  /** Multipart uploads must not get a JSON content-type. */
  isFormData?: boolean;
  signal?: AbortSignal;
}

/**
 * Thin fetch wrapper.
 *
 * IMPORTANT (agents.md 2.3):
 *  - We never read or write tokens from localStorage.
 *  - `credentials: "include"` is what makes the HttpOnly `pv_refresh` cookie
 *    travel with `/auth/refresh` and `/auth/logout`. That cookie is unreadable
 *    from JS by design, which is exactly why the access token lives in memory.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", accessToken, body, isFormData, signal } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    signal,
    body: body === undefined
      ? undefined
      : isFormData
        ? (body as FormData)
        : JSON.stringify(body),
  });

  return parse<T>(response) as Promise<T>;
}

export const apiBaseUrl = API_BASE_URL;
