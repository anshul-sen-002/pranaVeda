"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { AuthCheckingScreen } from "@/components/auth/AuthCheckingScreen";
import { useAuth } from "@/hooks/useAuth";

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

  if (status !== "authenticated") return <AuthCheckingScreen />;
  return <>{children}</>;
}
