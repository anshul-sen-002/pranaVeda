import { DotLoader } from "@/components/motion/DotLoader";

/** Loading state while a yoga detail page fetches pose data and steps. */
export default function YogaDetailLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <DotLoader alt="Loading pose" />
    </div>
  );
}
