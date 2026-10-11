"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";

/**
 * Guards the login/register pages for visitors who are ALREADY signed in.
 *
 * This is the exact behaviour you asked for: the page checks the session in the
 * background, and only acts once the server has answered.
 *
 *  - status "loading"     -> render nothing (the caller shows the checking screen)
 *  - status "authenticated" -> redirect away; showing a login form to someone
 *    who is already signed in is confusing
 *  - status "anonymous"   -> render the login/register form
 *
 * The redirect uses `replace` so the auth page is not left in history for the
 * Back button to return to.
 */
export function AuthRedirect({
  when,
  to,
  children,
}: {
  /** Redirect when the session is in this state. */
  when: "authenticated" | "anonymous";
  to: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status } = useAuth();

  // `to` is intentionally omitted: it is a constant route string, and
  // including it would re-run (and re-navigate) whenever the parent re-renders.
  // The guard below makes the redirect idempotent, so a repeat is harmless.
  useEffect(() => {
    if (status === when) router.replace(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, when, router]);

  if (status === when) return null;
  return <>{children}</>;
}
