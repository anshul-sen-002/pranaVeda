"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type AlertTone = "error" | "success" | "info";

const tones: Record<AlertTone, { wrap: string; icon: ReactNode }> = {
  error: {
    wrap: "bg-danger/10 border-danger/30 text-danger",
    icon: <AlertCircle className="size-4 shrink-0" aria-hidden="true" />,
  },
  success: {
    wrap: "bg-success/10 border-success/30 text-success",
    icon: <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />,
  },
  info: {
    wrap: "bg-primary-50 border-primary-200 text-primary-800",
    icon: <Info className="size-4 shrink-0" aria-hidden="true" />,
  },
};

export interface AlertProps {
  tone?: AlertTone;
  /** Form-level or server-level message (e.g. "Invalid credentials"). */
  children: ReactNode;
  className?: string;
}

/**
 * Inline banner for feedback that is not tied to a single field.
 * `role="alert"` so it is announced without stealing focus.
 */
export function Alert({ tone = "error", children, className }: AlertProps) {
  const { wrap, icon } = tones[tone];
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
        wrap,
        className,
      )}
    >
      {icon}
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}
