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
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary-100 text-primary-700 sm:size-10">
        {icon}
      </span>
      <span className="mt-2 text-2xl font-semibold leading-none tracking-tight text-heading sm:mt-3 sm:text-3xl">{value}</span>
      <span className="mt-1 line-clamp-1 text-xs font-semibold text-body sm:text-sm">{label}</span>
      <span className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted sm:text-xs">{hint}</span>
    </>
  );
  const cls = "mobile-compact flex min-h-[142px] flex-col rounded-2xl border border-[#e1e9df] bg-white p-3.5 shadow-[0_10px_30px_-28px_rgba(29,63,46,.5)] transition-[border-color,box-shadow] sm:min-h-[168px] sm:rounded-3xl sm:bg-gradient-gourd-white sm:p-5";
  return href ? (
    <Link href={href} className={cn(cls, "hover:border-primary-200 hover:shadow-[0_12px_30px_-20px_rgba(29,111,84,.35)]")}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6" aria-hidden="true">
      <div className="h-56 animate-pulse rounded-3xl bg-surface sm:h-64" />
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-surface sm:rounded-3xl" />
        ))}
      </div>
      <div className="grid gap-3 sm:gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-surface sm:rounded-3xl" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface sm:rounded-3xl" />
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
