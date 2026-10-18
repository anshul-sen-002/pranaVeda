import { DotLoader } from "@/components/motion/DotLoader";

/** Loading state while the yoga library fetches content, categories, and tags. */
export default function YogaLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <DotLoader alt="Loading yoga library" />
    </div>
  );
}
