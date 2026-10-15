"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/hooks/useAuth";

/**
 * Shared member chrome for the dashboard family (agents.md 3.2).
 * Calm sky-blue shell: brand + section nav + sign-out. Mobile collapses the
 * section links behind a horizontally scrollable strip so nothing overflows.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col bg-surface-tint">
      <header className="sticky top-0 z-40 border-b border-border-soft bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/" className="rounded-lg" aria-label="PranaVeda home">
            <Logo />
          </Link>
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="hidden max-w-40 truncate text-sm text-body sm:inline"
              title={user?.email ?? ""}
            >
              {user?.displayName?.trim() || user?.email}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex h-9 items-center rounded-full border border-border-soft bg-surface px-4 text-sm font-medium text-heading transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav
          aria-label="Dashboard sections"
          className="border-t border-border-soft/70"
        >
          <ul className="scrollbar-none mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-5 py-2 sm:px-8">
            {[
              { href: "/dashboard", label: "Overview" },
              { href: "/dashboard/history", label: "History" },
              { href: "/dashboard/saved", label: "Saved" },
              { href: "/dashboard/routines", label: "Routines" },
              { href: "/dashboard/challenges", label: "Challenges" },
              { href: "/dashboard/wellness", label: "Wellness" },
            ].map((item) => (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium text-body transition-colors hover:bg-primary-50 hover:text-primary-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
