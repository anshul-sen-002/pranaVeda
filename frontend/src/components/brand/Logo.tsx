import { cn } from "@/lib/cn";

export interface LogoProps {
  className?: string;
  /** Hide the wordmark, keeping only the lotus glyph (used in the header). */
  markOnly?: boolean;
}

/**
 * PranaVeda wordmark.
 *
 * Pure CSS/SVG so it needs no network request and scales cleanly. The lotus
 * uses the brand gradient; the text uses the calm navy heading colour.
 */
export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 32 32"
        className="size-8 shrink-0"
        role="img"
        aria-label="PranaVeda"
        fill="none"
      >
        {/* Calm outer leaf */}
        <path
          d="M16 2c2.6 3.1 3.9 6.2 3.9 9.1 0 3.6-1.7 6.6-3.9 8.8-2.2-2.2-3.9-5.2-3.9-8.8C12.1 8.2 13.4 5.1 16 2Z"
          fill="url(#pv-grad)"
          fillOpacity="0.9"
        />
        {/* Side leaves */}
        <path
          d="M15.4 12.4c-2.3-.6-4.4.2-6 2.2 2.6 1.5 5 1.5 6.9.4.6-.3 1.1-.8 1.5-1.3-1-1-1.7-1.3-2.4-1.3Z"
          fill="url(#pv-grad)"
          fillOpacity="0.55"
        />
        <path
          d="M16.6 12.4c2.3-.6 4.4.2 6 2.2-2.6 1.5-5 1.5-6.9.4-.6-.3-1.1-.8-1.5-1.3 1-1 1.7-1.3 2.4-1.3Z"
          fill="url(#pv-grad)"
          fillOpacity="0.55"
        />
        {/* Water line */}
        <path d="M4 26.5h24" stroke="url(#pv-grad)" strokeWidth="2" strokeLinecap="round" />
        <defs>
          <linearGradient id="pv-grad" x1="4" y1="2" x2="28" y2="27" gradientUnits="userSpaceOnUse">
            <stop stopColor="#45C0F5" />
            <stop offset="1" stopColor="#1789C7" />
          </linearGradient>
        </defs>
      </svg>

      {markOnly ? null : (
        <span className="text-lg font-semibold tracking-tight text-heading">
          Prana<span className="text-primary-600">Veda</span>
        </span>
      )}
    </span>
  );
}
