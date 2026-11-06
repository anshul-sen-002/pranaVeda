"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { BarChart3, Compass, Flower2, Heart, Play } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { MeditationIllustration } from "@/components/brand/MeditationIllustration";

const FEATURES = [
  { icon: Flower2, title: "Daily practice", copy: "Small steps. Big changes." },
  { icon: Play, title: "Guided sessions", copy: "For every level." },
  { icon: BarChart3, title: "Track your progress", copy: "See your growth." },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Split-screen shell for the login/register pages, matching the calm sky-blue
 * mockup: a soft gradient canvas with drifting leaves, a light brand header, a
 * left "Find your balance with yoga" hero with a breathing meditation
 * illustration and three feature badges, and the form in a floating white card
 * on the right. On mobile it collapses to one column so nothing overflows.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(ellipse_at_top_left,rgba(215,235,216,.72),transparent_42%),linear-gradient(180deg,#f8faf5_0%,#f2f6ef_100%)]">
      {/* Decorative corner leaves */}
      <Leaf className="pointer-events-none absolute -top-16 -left-20 size-40 text-primary-200/45 sm:size-52" />
      <Leaf className="pointer-events-none absolute -right-24 bottom-[-5rem] size-48 rotate-180 text-primary-200/35 sm:size-64" />

      {/* Brand header — screenshot: YOGA left, Explore yoga, "A healthier you" right */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-8 sm:py-5 lg:px-10">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className="rounded-lg transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:outline-none"
            aria-label="PranaVeda home"
          >
            <Logo />
          </Link>
          <Link
            href="/yoga"
            className="hidden shrink-0 items-center gap-1.5 rounded-lg text-sm text-muted transition-colors hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:outline-none sm:inline-flex"
          >
            <Compass className="size-4" aria-hidden="true" />
            Explore yoga
          </Link>
        </div>
        <p className="hidden shrink-0 items-center gap-1.5 text-sm text-muted sm:flex">
          <Heart className="size-4 text-muted" aria-hidden="true" />
          A healthier you
        </p>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-7xl content-start items-center gap-5 px-4 pt-8 pb-8 sm:gap-8 sm:px-8 sm:pt-5 sm:pb-14 lg:content-center lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-8">
        {/* ------------- Welcome panel (desktop only — mobile shows the form
            first, matching the calm single-column mockup) ------------- */}
        <section className="hidden text-center lg:block lg:text-left">
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance text-heading sm:text-5xl"
          >
            Find your balance
            <br />
            with{" "}
            <span className="relative inline-block text-primary-500">
              yoga
              <svg
                viewBox="0 0 120 12"
                fill="none"
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-2.5 w-full text-primary-300"
              >
                <path d="M2 8c22-6 74-6 116 0" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-body sm:mt-4 sm:text-base lg:mx-0"
          >
            Build a calmer, stronger, healthier you — one breath at a time.
          </motion.p>

          {/* Illustration is decorative — hidden on small screens so the form
              sits near the top and stays fully visible without scrolling. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="hidden sm:block"
          >
            <MeditationIllustration className="mx-auto mt-6 w-full max-w-[19rem] sm:max-w-sm lg:max-w-md" />
          </motion.div>

          {/* Feature badges — screenshot row: icon circle + title + copy */}
          <ul className="mt-8 hidden sm:grid sm:grid-cols-3 sm:gap-4">
            {FEATURES.map(({ icon: Icon, title, copy }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-primary-100/80 text-primary-600">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-heading">{title}</span>
                <span className="text-xs text-muted">{copy}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        {/* ------------- Form card ------------- */}
        <section className="mx-auto w-full max-w-md min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[1.5rem] border border-white/90 bg-white/95 p-5 shadow-[0_24px_70px_-40px_rgba(29,76,53,.28)] backdrop-blur-sm sm:rounded-[2rem] sm:p-8 md:p-10"
          >
            {children}
          </motion.div>
        </section>
      </main>
    </div>
  );
}

/** Decorative leaf used in the page corners. */
function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden="true">
      <path d="M40 160C40 100 90 40 170 30c6 78-44 138-130 130Z" fill="currentColor" />
      <path d="M40 160C70 120 110 80 170 30" stroke="#14543f" strokeOpacity="0.12" strokeWidth="3" />
    </svg>
  );
}
