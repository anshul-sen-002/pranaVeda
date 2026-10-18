import { DotLoader } from "@/components/motion/DotLoader";

/** Loading state while the breathing studio initializes. */
export default function BreathingLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <DotLoader text="Preparing breathing studio" />
    </div>
  );
}
