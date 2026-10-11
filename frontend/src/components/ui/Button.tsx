"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-[transform,box-shadow,background-color,opacity] duration-200 " +
  "disabled:pointer-events-none disabled:opacity-60 " +
  // Slight lift on hover, and a small press-down on active: calm, not flashy.
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]";

const variants: Record<ButtonVariant, string> = {
  // The primary CTA carries the brand gradient (design-tokens.md).
  primary:
    "bg-gradient-primary text-white shadow-[0_8px_20px_-8px_rgba(23,137,199,0.65)] " +
    "hover:shadow-[0_12px_26px_-8px_rgba(23,137,199,0.75)]",
  secondary:
    "bg-surface text-heading border border-border-soft hover:border-primary-300 hover:bg-primary-50",
  ghost: "text-primary-700 hover:bg-primary-50",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

/**
 * Exposed so a `<Link>` can look identical to a `<Button>` without nesting an
 * anchor inside a button (which is invalid HTML). See LinkButton below.
 */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  fullWidth = false,
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, fullWidth, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      // aria-busy tells assistive tech the action is in progress.
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={buttonClasses(variant, size, fullWidth, className)}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
});


function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
