import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * Common image fallback (per user decision): whenever a backend cover is
 * missing (`featuredImageUrl` / `coverImageUrl` null) or fails to load, the
 * card shows this calm lotus tile instead of a broken image. The sheltered
 * <img> reports failures through `onCoverError`, which swaps in the fallback
 * without a re-render loop.
 */
export function CoverFallback({ className, label }: { className?: string; label?: string }) {
  return (
    <div
      role="img"
      aria-label={label ?? "Cover image coming soon"}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary-50 via-surface-tint to-primary-100 text-primary-400",
        className,
      )}
    >
      <svg viewBox="0 0 48 40" fill="currentColor" aria-hidden="true" className="size-10 opacity-70">
        <path d="M24 2c3.5 5.5 5.2 11 5.2 16.4 2.8-2.4 6.6-3.6 10.4-3.2-.8 5-3.6 9.2-7.8 11.8 3.6.2 7-.8 9.8-2.8-.2 4.8-2.4 8.8-5.8 11.4A19.6 19.6 0 0 1 24 38a19.6 19.6 0 0 1-11.8-2.4c-3.4-2.6-5.6-6.6-5.8-11.4 2.8 2 6.2 3 9.8 2.8-4.2-2.6-7-6.8-7.8-11.8 3.8-.4 7.6.8 10.4 3.2C19 13 20.7 7.5 24 2Z" />
      </svg>
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary-600/80">
        <ImageOff className="size-3.5" aria-hidden="true" />
        Image coming soon
      </span>
    </div>
  );
}


/**
 * Renders a backend cover URL; falls back to <CoverFallback/> when the URL
 * is absent OR the download fails (expired link, 404, offline). Guards
 * against error loops by hiding the <img> after the first failure.
 */
export function CoverImage({
  src,
  alt,
  className,
  imgClassName,
  eager = false,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <CoverFallback className={className} label={alt} />;
  return (
    <div className={cn("h-full w-full overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}
