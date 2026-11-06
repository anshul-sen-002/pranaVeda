import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard | PranaVeda",
  description: "Your personal practice space — streaks, sessions, routines, and saved practices.",
};

/**
 * Member dashboard (agents.md 2.9). Server Component wrapper so `metadata`
 * stays exportable; all session-gating and data fetching live in
 * <DashboardView> behind <MemberGuard>.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <DashboardView showWelcome={params.welcome === "1"} />;
}
