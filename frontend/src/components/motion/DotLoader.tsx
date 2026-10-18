"use client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { cn } from "@/lib/cn";

/**
 * Animated dot-loading screen — used for page-level or major-section loading
 * states only, not small components. The dot animation provides calm,
 * non-busy feedback that matches the product's visual language.
 *
 * */

 <DotLoader className="h-64 w-64" /> 
export function DotLoader({ className, alt = "Loading" }: { className?: string; alt?: string }) {
  return (
    <div
      aria-live="polite"
      role="status"
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <DotLottieReact
        src="https://lottie.host/3d53f9b2-7c1a-4c7d-a8b0-f6e8f2a4f3c4/dot-loader.json"
        loop
        autoplay
        className="size-12 sm:size-16"
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-body">{alt}</span>
    </div>
  );
}
