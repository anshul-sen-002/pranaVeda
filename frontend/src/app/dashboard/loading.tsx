import { LoadingOverlay } from "@/components/layout/LoadingOverlay";

/** Loading state while the dashboard fetches streaks, sessions, wellness, and routines. */
export default function DashboardLoading() {
  return <LoadingOverlay title="Getting your dashboard ready" description="Gathering your practice, saved items, and weekly progress." />;
}
