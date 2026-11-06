import { DashboardLoadingSkeleton } from "@/components/dashboard/DashboardView";

/** Keep navigation loading quiet; the welcome overlay is reserved for registration. */
export default function DashboardLoading() {
  return <DashboardLoadingSkeleton />;
}
