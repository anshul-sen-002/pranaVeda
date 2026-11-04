import { ModuleLoading } from "@/components/layout/ModuleLoading";

/** Loading state while the AI chat loads conversation history. */
export default function AiLoading() {
  return (
    <ModuleLoading text="Loading AI companion" />
  );
}
