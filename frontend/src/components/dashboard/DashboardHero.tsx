"use client";

import Link from "next/link";
import { Flower2, ListMusic, Play } from "lucide-react";

/** Gradient greeting banner with primary actions. */
export function DashboardHero({ firstName, practisedToday }: { firstName?: string; practisedToday: boolean }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-primary px-6 py-7 text-white sm:px-8">
      <Flower2 className="pointer-events-none absolute -right-6 -bottom-8 size-40 text-white/15" aria-hidden="true" />
      <p className="text-sm text-white/80">
        {practisedToday ? "Beautiful — you practised today." : "Take a breath. Today is open."}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        {firstName ? <>Welcome back, {firstName}.</> : "Welcome to your practice space."}
      </h1>
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <Link href="/yoga" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-0.5">
          <Play className="size-4" aria-hidden="true" />
          Start a session
        </Link>
        <Link href="/dashboard/routines" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/40 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10">
          <ListMusic className="size-4" aria-hidden="true" />
          My routines
        </Link>
      </div>
    </section>
  );
}
