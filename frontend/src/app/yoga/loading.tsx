import { ModuleLoading } from "@/components/layout/ModuleLoading";

/** Loading state while the yoga library fetches content, categories, and tags. */
export default function YogaLoading() {
  return <ModuleLoading text="Loading yoga library" quote="A strong body creates a calm mind." />;
}
