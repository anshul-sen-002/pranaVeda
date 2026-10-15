"use client";

import { useCallback, useEffect, useRef } from "react";

import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api/auth";

/**
 * Runs an access-token request, refreshing once on 401 and retrying.
 *
 * Why this exists: the in-memory access token is short-lived. When it lapses
 * mid-visit the first request 401s, but the HttpOnly refresh cookie is usually
 * still valid — so we exchange it for a fresh token (exactly once) and retry
 * the original call before surfacing an error. The one-shot `refreshing` guard
 * mirrors AuthProvider: parallel dashboard calls share a single refresh so we
 * never trip the backend's token-reuse detection.
 */
export function useAuthedFetch() {
  const { accessToken, applyRefreshedToken } = useAuth();
  const refreshing = useRef<Promise<string | null> | null>(null);

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

        if (!refreshing.current) {
          refreshing.current = authApi
            .refresh()
            .then((session) => {
              applyRefreshedToken(session.accessToken, session.user);
              return session.accessToken;
            })
            .catch(() => null)
            .finally(() => {
              // Clear on the next tick so concurrent waiters still share it.
              const done = refreshing.current;
              queueMicrotask(() => {
                if (refreshing.current === done) refreshing.current = null;
              });
            });
        }
        const next = await refreshing.current;
        if (!next || aborted()) throw error;
        return fn(next);
      }
    },
    [accessToken, applyRefreshedToken],
  );

  // Drop the cached promise when the screen unmounts so a later visit starts clean.
  useEffect(() => () => {
    refreshing.current = null;
  }, []);

  return run;
}
