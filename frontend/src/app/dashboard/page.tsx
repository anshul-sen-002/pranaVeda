import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard | PranaVeda",
  description: "Your personal practice space — streaks, sessions, challenges, and saved practices.",
};

/**
 * Member dashboard (agents.md 2.9). Server Component wrapper so `metadata`
 * stays exportable; all session-gating and data fetching live in
 * <DashboardView> behind <MemberGuard>.
 */
export default function DashboardPage() {
  return <DashboardView />;
}
