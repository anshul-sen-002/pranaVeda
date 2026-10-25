"use client";

import Link from "next/link";
import Image from "next/image";
import { ListMusic, Play } from "lucide-react";

import { LotusMark } from "@/components/brand/LotusMark";

/** Greeting banner. Displays a warm hero image with a dark overlay so the
 * white text stays readable. Height matches the library hero (AsanaHero)
 * for a consistent page rhythm.
 */
export function DashboardHero({ firstName, practisedToday }: { firstName?: string; practisedToday: boolean }) {
  const name = firstName?.trim() || "Administrator";
  return (
    <section
      className="mobile-compact relative overflow-hidden rounded-3xl border border-border-soft px-4 py-6 sm:h-64 sm:px-8 sm:py-8 h-56"
      aria-labelledby="dashboard-greeting"
    >
      <Image
        src="/yoga.png"
        alt=""
        fill
        className="object-cover"
        priority
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/35" aria-hidden="true" />
      <div className="relative z-10">
        <LotusMark className="pointer-events-none absolute right-2 -bottom-2 size-36 text-white/20 sm:-right-10 sm:-bottom-14 sm:size-56" />
        <LotusMark className="pointer-events-none absolute top-4 right-40 hidden size-16 text-white/15 md:block" />
        <p className="text-[13px] text-white/85 sm:text-sm">
          {practisedToday ? "Beautiful — you practised today." : "Take a breath. Today is open."}
        </p>
        <h1 id="dashboard-greeting" className="mt-1 text-xl font-semibold tracking-tight text-balance text-white sm:text-[32px] sm:leading-tight">
          Welcome back, {name}.
        </h1>
        <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:gap-2.5">
        <Link href="/yoga" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-primary px-5 text-sm font-semibold text-primary-700 transition-transform hover:-translate-y-0.5 sm:px-6">
          <Play className="size-4" aria-hidden="true" />
          Start a session
        </Link>
        <Link href="/dashboard/routines" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/50 px-5 text-sm font-medium text-white transition-colors hover:bg-gradient-primary/10 sm:px-6">
          <ListMusic className="size-4" aria-hidden="true" />
          My routines
        </Link>
      </div>
      </div>
    </section>
  );
}
