"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import type { ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";

/**
 * Client-side gate for member pages (agents.md 2.2).
 * The backend is authoritative (every /api/v1/me/** call re-resolves the
 * owner from the security context); this only keeps anonymous visitors from
 * seeing member UI before their request 401s, and returns them afterwards.
 */
export function MemberGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  return (
    <AnimatePresence mode="wait">
      {status !== "authenticated" ? (
        <LoadingOverlay
          key={status}
          title={status === "loading" ? "Checking your session" : "Taking you to sign in"}
          description={status === "loading" ? "We’re securely opening your personal practice space." : "Sign in to continue to your personal space."}
        />
      ) : children}
    </AnimatePresence>
  );
}
