import { ModuleLoading } from "@/components/layout/ModuleLoading";

/** Loading state while a yoga detail page fetches pose data and steps. */
export default function YogaDetailLoading() {
  return <ModuleLoading text="Loading pose" quote="A strong body creates a calm mind." />;
}
