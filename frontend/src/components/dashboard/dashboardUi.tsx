"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function StatCard({
  icon,
  value,
  label,
  hint,
  href,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  hint: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
        {icon}
      </span>
      <span className="mt-3 text-2xl font-semibold text-heading">{value}</span>
      <span className="text-sm font-medium text-body">{label}</span>
      <span className="mt-0.5 text-xs text-muted">{hint}</span>
    </>
  );
  const cls = "flex flex-col rounded-3xl border border-border-soft bg-surface p-5 transition-colors";
  return href ? (
    <Link href={href} className={cn(cls, "hover:border-primary-200 hover:bg-primary-50/40")}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="h-44 animate-pulse rounded-3xl bg-surface" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-3xl bg-surface" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-3xl bg-surface" />
        <div className="h-64 animate-pulse rounded-3xl bg-surface" />
      </div>
    </div>
  );
}

export function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-3xl border border-border-soft bg-surface px-6 py-14 text-center">
      <div>
        <p className="font-semibold text-heading">Your dashboard didn&apos;t load</p>
        <p className="mt-1 text-sm text-muted">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-medium text-white"
      >
        Try again
      </button>
    </div>
  );
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function titleCase(raw: string): string {
  return raw.charAt(0) + raw.slice(1).toLowerCase();
}
