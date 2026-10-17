import type { ReactNode } from "react";

/** Consistent heading for the dashboard sub-pages. */
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-heading">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-body">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
