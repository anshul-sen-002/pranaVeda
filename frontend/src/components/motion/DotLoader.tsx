"use client";
import { useEffect, useState } from "react";
import { Lottie } from "lottie-react";

import { cn } from "@/lib/cn";

interface DotLoaderProps {
  className?: string;
  /** Displayed loading text (e.g. "Checking your session…"). */
  text?: string;
  /** Animation size. */
  size?: "sm" | "md" | "lg";
  /** Compact inline variant for buttons / small UI (horizontal, no gap-3 column). */
  inline?: boolean;
}

// Module-level cache so every DotLoader instance shares one JSON fetch instead
// of re-requesting /dot-loader.json per button / card on the screen.
let cachedAnimation: unknown = null;
let fetchPromise: Promise<unknown> | null = null;

const SIZE_CLASSES: Record<string, string> = {
  sm: "size-6",
  md: "size-10 sm:size-12",
  lg: "size-14 sm:size-16",
};

const FALLBACK_CLASSES: Record<string, string> = {
  sm: "inline-block size-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600",
  md: "inline-block size-10 sm:size-12 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600",
  lg: "inline-block size-14 sm:size-16 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600",
};

/**
 * Single animated dot-loader used everywhere loading state is shown.
 *
 * - `text` is the visible label passed by each module.
 * - `size` scales the animation (sm/md/lg).
 * - `inline` renders a horizontal row suitable for buttons / compact UI.
 * Falls back to a CSS spinner if the Lottie JSON fails to load.
 */
export function DotLoader({
  className,
  text = "Loading",
  size = "md",
  inline = false,
}: DotLoaderProps) {
  const [animationData, setAnimationData] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cachedAnimation != null) {
        if (!cancelled) setAnimationData(cachedAnimation);
        return;
      }
      if (!fetchPromise) {
        fetchPromise = fetch("/dot-loader.json", { cache: "force-cache" })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((data) => {
            cachedAnimation = data;
            return data;
          });
      }
      try {
        const data = await fetchPromise;
        if (!cancelled) setAnimationData(data);
      } catch {
        if (!cancelled) setAnimationData(null);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sizeClass = SIZE_CLASSES[size];
  const fallbackClass = FALLBACK_CLASSES[size];

  if (inline) {
    return (
      <span
        aria-live="polite"
        role="status"
        className={cn("inline-flex items-center gap-2 text-xs font-medium text-body", className)}
      >
        {animationData ? (
          <Lottie src={animationData} loop autoplay className={sizeClass} aria-hidden="true" />
        ) : (
          <span className={fallbackClass} aria-hidden="true" />
        )}
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
      {animationData ? (
        <Lottie src={animationData} loop autoplay className={sizeClass} aria-hidden="true" />
      ) : (
        <span className={fallbackClass} aria-hidden="true" />
      )}
      <span className="text-sm font-medium text-body">{text}</span>
    </span>
  );
}
