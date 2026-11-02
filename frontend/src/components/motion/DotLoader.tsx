"use client";

import { cn } from "@/lib/cn";

interface DotLoaderProps {
  className?: string;
  /** Displayed loading text (e.g. "Checking your session…"). */
  text?: string;
  /** Spinner size. */
  size?: "sm" | "md" | "lg";
  /** Compact inline variant for buttons / small UI (horizontal, no gap-3 column). */
  inline?: boolean;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: "size-6",
  md: "size-10 sm:size-12",
  lg: "size-14 sm:size-16",
};

export function DotLoader({
  className,
  text = "Loading",
  size = "md",
  inline = false,
}: DotLoaderProps) {
  const sizeClass = SIZE_CLASSES[size];

  if (inline) {
    return (
      <span
        aria-live="polite"
        role="status"
        className={cn("inline-flex items-center gap-2 text-xs font-medium text-body", className)}
      >
        <span className={cn(sizeClass, "animate-spin rounded-full border-2 border-primary-200 border-t-primary-600")} aria-hidden="true" />
        <span>{text}</span>
      </span>
    );
  }

  return (
    <span
      aria-live="polite"
      role="status"
      className={cn("flex flex-col items-center justify-center gap-3", className)}
    >
      <span className={cn(sizeClass, "animate-spin rounded-full border-2 border-primary-200 border-t-primary-600")} aria-hidden="true" />
      <span className="text-sm font-medium text-body">{text}</span>
    </span>
  );
}
