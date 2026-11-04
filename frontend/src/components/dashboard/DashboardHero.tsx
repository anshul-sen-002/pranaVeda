"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check, Leaf, ListMusic } from "lucide-react";

/** Warm, responsive welcome panel and clear paths into the user's practice. */
export function DashboardHero({ firstName, practisedToday }: { firstName?: string; practisedToday: boolean }) {
  const name = firstName?.trim() || "there";
  return (
    <section className="relative isolate min-h-[220px] overflow-hidden rounded-[1.5rem] border border-[#dce8dc] bg-[#264f3c] p-4 shadow-[0_18px_45px_-35px_rgba(17,57,39,.55)] sm:min-h-[260px] sm:rounded-3xl sm:p-8" aria-labelledby="dashboard-greeting">
      <Image src="/yoga.png" alt="" fill priority sizes="(max-width: 640px) 100vw, (max-width: 1280px) 80vw, 1100px" className="-z-20 object-cover object-[center_54%]" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#143c2d]/90 via-[#143c2d]/72 to-[#143c2d]/20" aria-hidden="true" />
      <div className="relative flex min-h-[188px] flex-col justify-between gap-5 sm:min-h-[196px] sm:max-w-2xl sm:gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            {practisedToday ? <Check className="size-3.5" aria-hidden="true" /> : <Leaf className="size-3.5" aria-hidden="true" />}
            {practisedToday ? "Practice logged today" : "A little time for yourself"}
          </span>
          <h1 id="dashboard-greeting" className="mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-3xl">Welcome back, {name}.</h1>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-white/80">{practisedToday ? "Take a moment to notice how good it feels to show up for yourself." : "Choose a gentle practice and make today your own."}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
          <Link href="/yoga" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-primary-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f5faf5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800 sm:px-5 sm:text-sm">
            Start a session <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/dashboard/routines" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/35 bg-white/10 px-3 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-800 sm:px-5 sm:text-sm">
            <ListMusic className="size-4" aria-hidden="true" /> My routines
          </Link>
        </div>
      </div>
    </section>
  );
}
