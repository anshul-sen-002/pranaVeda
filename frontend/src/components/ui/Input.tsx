"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Validation message. When present the field is marked invalid. */
  error?: string;
  /** Helper copy shown under the field when there is no error. */
  hint?: string;
  icon?: ReactNode;
}

/**
 * Labelled text input.
 *
 * Accessibility: the label is always programmatically associated via a
 * generated id, errors are wired through aria-describedby/aria-invalid, and
 * the error text lives in an aria-live region so it is announced.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon, className, id: providedId, ...props },
  ref,
) {
  const autoId = useId();
  const id = providedId ?? autoId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-heading">
        {label}
      </label>

      <div className="relative">
        {icon ? (
          <span
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full rounded-xl border bg-surface text-base text-heading transition-colors duration-200 sm:h-12",
            "placeholder:text-muted",
            "focus:outline-none focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-200",
            icon ? "pl-11" : "pl-4",
            "pr-4",
            error ? "border-danger" : "border-border-soft",
            className,
          )}
          {...props}
        />
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
