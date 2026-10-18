"use client";

import Link from "next/link";
import { ListMusic, Play } from "lucide-react";

import { LotusMark } from "@/components/brand/LotusMark";

/** Gradient greeting banner matching screenshot 3, with lotus motif. */
export function DashboardHero({ firstName, practisedToday }: { firstName?: string; practisedToday: boolean }) {
  const name = firstName?.trim() || "Administrator";
  return (
    <section className="mobile-compact relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3fb6ef] via-[#1fa9ed] to-[#1668b4] px-4 py-5 text-white sm:px-8 sm:py-7" aria-labelledby="dashboard-greeting">
      <LotusMark className="pointer-events-none absolute -right-8 -bottom-12 size-44 text-white/20 sm:-right-10 sm:-bottom-14 sm:size-56" />
      <LotusMark className="pointer-events-none absolute top-4 right-40 hidden size-16 text-white/15 md:block" />
      <p className="relative text-[13px] text-white/85 sm:text-sm">
        {practisedToday ? "Beautiful — you practised today." : "Take a breath. Today is open."}
      </p>
      <h1 id="dashboard-greeting" className="relative mt-1 text-xl font-semibold tracking-tight text-balance sm:text-[32px] sm:leading-tight">
        Welcome back, {name}.
      </h1>
      <div className="relative mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:gap-2.5">
        <Link href="/yoga" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-0.5 sm:px-6">
          <Play className="size-4" aria-hidden="true" />
          Start a session
        </Link>
        <Link href="/dashboard/routines" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/50 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:px-6">
          <ListMusic className="size-4" aria-hidden="true" />
          My routines
        </Link>
      </div>
    </section>
  );
}
