import { authApi } from "@/lib/api/auth";
import type { TokenResponse } from "@/lib/api/types";

/**
 * Single-flight refresh gate shared by the auth provider and the fetch layer.
 *
 * Why this exists: every tab replay of `POST /auth/refresh` rotates the
 * refresh token server-side. Two parallel calls (provider bootstrap racing a
 * 401-triggered fetch refresh) mean the second call reuses an already-rotated
 * token — and the backend treats that as theft, revoking the WHOLE session.
 * Keeping one shared promise across both call sites makes a double refresh
 * impossible, so refresh can no longer log the user out on reload.
 *
 * The promise resolves to the session, or null when no valid cookie exists
 * (never signed in, or expired). A revoked/rotated token also yields null.
 */
let inFlight: Promise<TokenResponse | null> | null = null;

export function sharedRefresh(): Promise<TokenResponse | null> {
  if (!inFlight) {
    inFlight = authApi
      .refresh()
      .catch(() => null)
      .finally(() => {
        // Clear on the next tick so concurrent waiters share the same promise.
        const done = inFlight;
        queueMicrotask(() => {
          if (inFlight === done) inFlight = null;
        });
      });
  }
  return inFlight;
}

/** Drop the cached refresh (used when forcing a fresh bootstrap). */
export function resetSharedRefresh(): void {
  inFlight = null;
}
