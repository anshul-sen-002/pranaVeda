import { cn } from "@/lib/cn";

/** Small lotus glyph used in the sidebar quote cards and hero corners. */
export function LotusMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" fill="currentColor" aria-hidden="true" className={cn("shrink-0", className)}>
      <path d="M24 2c3.5 5.5 5.2 11 5.2 16.4 2.8-2.4 6.6-3.6 10.4-3.2-.8 5-3.6 9.2-7.8 11.8 3.6.2 7-.8 9.8-2.8-.2 4.8-2.4 8.8-5.8 11.4A19.6 19.6 0 0 1 24 38a19.6 19.6 0 0 1-11.8-2.4c-3.4-2.6-5.6-6.6-5.8-11.4 2.8 2 6.2 3 9.8 2.8-4.2-2.6-7-6.8-7.8-11.8 3.8-.4 7.6.8 10.4 3.2C19 13 20.7 7.5 24 2Z" />
      <ellipse cx="24" cy="33.5" rx="7" ry="2.4" opacity=".55" />
    </svg>
  );
}
