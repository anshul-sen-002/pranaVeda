import { ModuleLoading } from "@/components/layout/ModuleLoading";

/** Loading state while the breathing studio initializes. */
export default function BreathingLoading() {
  return <ModuleLoading text="Preparing breathing studio" quote="Breathe in calm, breathe out tension." />;
}
