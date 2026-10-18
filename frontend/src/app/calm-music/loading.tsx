import { DotLoader } from "@/components/motion/DotLoader";

/** Loading state while calm music tracks are fetched. */
export default function CalmMusicLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <DotLoader text="Loading calming sounds" />
    </div>
  );
}
