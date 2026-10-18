import { DotLoader } from "@/components/motion/DotLoader";

/** Loading state for the admin content studio. */
export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <DotLoader text="Loading admin studio" />
    </div>
  );
}
