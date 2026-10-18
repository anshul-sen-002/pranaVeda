import { DotLoader } from "@/components/motion/DotLoader";

/** Loading state while the AI chat loads conversation history. */
export default function AiLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <DotLoader text="Loading AI companion" />
    </div>
  );
}
