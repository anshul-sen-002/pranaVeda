"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "@/lib/api/auth";
import type { LoginRequest, RegisterRequest, UserSummary } from "@/lib/api/types";

/**
 * Auth state machine.
 *
 * Deliberate design decisions (agents.md 2.3):
 *  - The access token lives ONLY in memory here. It is never written to
 *    localStorage/sessionStorage, so an XSS bug cannot exfiltrate a token
 *    that outlives the tab.
 *  - "Am I signed in?" is decided by the SERVER, not by a local flag. On first
 *    render we call `/auth/refresh`, which only succeeds if the HttpOnly
 *    `pv_refresh` cookie is still valid. There is no way for the client to
 *    fake that, so a forged client cannot appear logged in.
 *  - `status` is tri-state so the UI can show a calm "checking" state instead
 *    of flashing the login screen before we know the answer.
 *
 * status:
 *  - "loading"     -> server verdict pending; render skeletons, not content
 *  - "authenticated" -> live access token in memory + user profile
 *  - "anonymous"   -> no valid refresh cookie (never signed in, or it expired)
 */
export type AuthStatus = "loading" | "authenticated" | "anonymous";

export interface AuthContextValue {
  status: AuthStatus;
  user: UserSummary | null;
  /** In-memory access token. Never persisted to storage. */
  accessToken: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  /**
   * Replaces the access token after a successful refresh.
   * Used by the fetch layer when a request returns 401.
   */
  applyRefreshedToken: (token: string, user: UserSummary | null) => void;
  /** Forces a re-validation against the server (e.g. after profile edits). */
  revalidate: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserSummary | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Guarantees only one refresh call runs at a time. Without this, a page with
  // several parallel requests could fire 5 refreshes and trip the backend's
  // token-reuse detection, which would revoke the whole session.
  const inFlight = useRef<Promise<void> | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const bootstrap = useCallback((): Promise<void> => {
    if (inFlight.current) return inFlight.current;

    const run = (async () => {
      try {
        const session = await authApi.refresh();
        if (!mounted.current) return;
        setAccessToken(session.accessToken);
        setUser(session.user);
        setStatus("authenticated");
      } catch {
        if (!mounted.current) return;
        // 401 (or any failure) simply means "no valid session". This is a
        // normal outcome for first-time visitors, not an error condition.
        setAccessToken(null);
        setUser(null);
        setStatus("anonymous");
      } finally {
        inFlight.current = null;
      }
    })();

    inFlight.current = run;
    return run;
  }, []);

  // Server-side validation of the session on every app load.
  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (payload: LoginRequest) => {
    const session = await authApi.login(payload);
    setAccessToken(session.accessToken);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const session = await authApi.register(payload);
    setAccessToken(session.accessToken);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    // Optimistically clear local state so the UI reacts instantly, then tell
    // the server to revoke the token and clear the cookie.
    setAccessToken(null);
    setUser(null);
    setStatus("anonymous");
    try {
      await authApi.logout();
    } catch (error) {
      // Logout must always succeed locally. If the network is down the session
      // will still be unusable once the access token is gone from memory, and
      // the stale cookie simply fails to refresh next time.
      if (!(error instanceof Error)) throw error;
    }
  }, []);

  const applyRefreshedToken = useCallback((token: string, nextUser: UserSummary | null) => {
    setAccessToken(token);
    if (nextUser) setUser(nextUser);
    setStatus("authenticated");
  }, []);

  const revalidate = useCallback(async () => {
    inFlight.current = null;
    await bootstrap();
  }, [bootstrap]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      login,
      register,
      logout,
      applyRefreshedToken,
      revalidate,
    }),
    [status, user, accessToken, login, register, logout, applyRefreshedToken, revalidate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
