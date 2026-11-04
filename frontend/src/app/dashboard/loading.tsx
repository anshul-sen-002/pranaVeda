import { ModuleLoading } from "@/components/layout/ModuleLoading";

/** Loading state while the dashboard fetches streaks, sessions, wellness, and routines. */
export default function DashboardLoading() {
  return <ModuleLoading text="Loading your dashboard" />;
}
