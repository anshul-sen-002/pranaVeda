"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AuthCheckingScreen } from "@/components/auth/AuthCheckingScreen";
import { useAuth } from "@/hooks/useAuth";
import type { ReactNode } from "react";

/**
 * Client-side gate for admin pages. The server is authoritative
 * (`/api/v1/admin/**` requires ROLE_ADMIN), this only prevents an
 * unauthorized user from seeing admin UI before their request 403s.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (status === "authenticated" && user && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [status, user, router, pathname]);

  if (status !== "authenticated" || !user || user.role !== "ADMIN") {
    return <AuthCheckingScreen />;
  }
  return <>{children}</>;
}
