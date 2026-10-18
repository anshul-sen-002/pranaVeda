"use client";

import { useCallback, useEffect, useRef } from "react";

import { useAuth } from "@/hooks/useAuth";
import { sharedRefresh } from "@/lib/api/sessionRefresh";

/**
 * Runs an access-token request, refreshing once on 401 and retrying.
 *
 * Why this exists: the in-memory access token is short-lived. When it lapses
 * mid-visit the first request 401s, but the HttpOnly refresh cookie is usually
 * still valid — so we exchange it for a fresh token (exactly once) and retry
 * the original call before surfacing an error. `sharedRefresh` is the same
 * single-flight gate the AuthProvider bootstrap uses, so parallel dashboard
 * calls plus a bootstrap can never fire two refreshes and trip the backend's
 * token-reuse detection (which would revoke the session).
 */
export function useAuthedFetch() {
  const { accessToken, applyRefreshedToken } = useAuth();

  const run = useCallback(
    async <T,>(fn: (token: string) => Promise<T>, signal?: AbortSignal): Promise<T> => {
      if (!accessToken) throw new Error("Not signed in.");
      const aborted = () => signal?.aborted;

      try {
        return await fn(accessToken);
      } catch (error: unknown) {
        const needsRefresh =
          typeof error === "object" &&
          error !== null &&
          "isUnauthorized" in error &&
          (error as { isUnauthorized: boolean }).isUnauthorized;
        if (!needsRefresh || aborted()) throw error;

        const session = await sharedRefresh();
        if (!session || aborted()) throw error;
        applyRefreshedToken(session.accessToken, session.user);
        return fn(session.accessToken);
      }
    },
    [accessToken, applyRefreshedToken],
  );

  return run;
}
