import { AppShell } from "@/components/layout/AppShell";
import { DotLoader } from "@/components/motion/DotLoader";

/** Keeps the shared navigation shell visible while a module route is loading. */
export function ModuleLoading({ text, quote }: { text: string; quote?: string }) {
  return (
    <AppShell quote={quote}>
      <div className="flex min-h-[55vh] items-center justify-center rounded-3xl border border-[#e6eadd] bg-white/70">
        <DotLoader text={text} />
      </div>
    </AppShell>
  );
}
