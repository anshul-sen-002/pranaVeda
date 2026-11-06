"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";

/** Mobile back control that returns to the page the user actually came from. */
export function MobileBackButton({
  fallbackHref = "/dashboard",
  label = "Go back",
  className,
}: {
  fallbackHref?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-transparent text-black transition-opacity hover:opacity-65 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30",
        className,
      )}
    >
      <ArrowLeft className="size-6" strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
}
