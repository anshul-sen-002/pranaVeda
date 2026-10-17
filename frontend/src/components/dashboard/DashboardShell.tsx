"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";

/**
 * Shared member chrome for the dashboard family (agents.md 3.2).
 * Thin wrapper over <AppShell> so every member page shares the sidebar,
 * topbar, quote card, and mobile strip. Auth + sign-out live in the topbar.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
