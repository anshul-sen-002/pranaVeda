import Image from "next/image";

import { cn } from "@/lib/cn";

export interface LogoProps {
  className?: string;
  /** Hide the wordmark, keeping only the lotus glyph (used in the header). */
  markOnly?: boolean;
}

/**
 * PranaVeda wordmark.
 *
 * The lotus mark is served from the shared public asset (pranaveda.png);
 * the text uses the calm navy heading colour.
 */
export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/pranaveda.png"
        alt="PranaVeda"
        width={32}
        height={32}
        className="size-8 shrink-0"
        priority
      />

      {markOnly ? null : (
        <span className="text-lg font-semibold tracking-tight text-heading">
          Prana<span className="text-primary-600">Veda</span>
        </span>
      )}
    </span>
  );
}
