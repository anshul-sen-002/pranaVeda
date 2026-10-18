import { DotLoader } from "@/components/motion/DotLoader";

/** Loading state while the dashboard fetches streaks, sessions, wellness, and routines. */
export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <DotLoader text="Loading your dashboard" />
    </div>
  );
}
