"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { BarChart3, Compass, Flower2, Heart, Menu, Play } from "lucide-react";

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
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-primary-100/70 via-white to-primary-100/50">
      {/* Decorative corner leaves */}
      <Leaf className="pointer-events-none absolute -top-12 -left-14 size-44 text-primary-200/60" />
      <Leaf className="pointer-events-none absolute -right-16 bottom-[-4rem] size-56 rotate-180 text-primary-200/40" />

      {/* Brand header */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="rounded-lg transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:outline-none"
          >
            <Logo />
          </Link>
          <Link
            href="/yoga"
            className="hidden items-center gap-1.5 rounded-lg text-sm text-muted transition-colors hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:outline-none sm:inline-flex"
          >
            <Compass className="size-4" aria-hidden="true" />
            Explore yoga
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <Heart className="size-4 fill-primary-500 text-primary-500" aria-hidden="true" />
            A healthier you
          </span>
          <Menu className="size-5" aria-hidden="true" />
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-5 pt-2 pb-14 lg:grid-cols-2 lg:gap-10">
        {/* ------------- Hero panel ------------- */}
        <section className="text-center lg:text-left">
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl leading-[1.1] font-semibold tracking-tight text-balance text-heading sm:text-4xl xl:text-5xl"
          >
            Find your balance
            <br />
            with{" "}
            <span className="relative inline-block text-primary-600">
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
            className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-body lg:mx-0"
          >
            Build a calmer, stronger, healthier you — one breath at a time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <MeditationIllustration className="mx-auto mt-6 w-full max-w-[19rem] sm:max-w-sm lg:max-w-md" />
          </motion.div>

          {/* Feature badges — desktop only, to keep mobile focused on the form */}
          <ul className="mt-8 hidden lg:grid lg:grid-cols-3 lg:gap-4">
            {FEATURES.map(({ icon: Icon, title, copy }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/60 p-4 text-center"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-heading">{title}</span>
                <span className="text-xs text-muted">{copy}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        {/* ------------- Form card ------------- */}
        <section className="mx-auto w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-[0_24px_70px_-40px_rgba(10,61,89,0.45)] backdrop-blur-sm sm:p-9"
          >
            <div className="mb-7 flex justify-center">
              <Logo />
            </div>
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
      <path d="M40 160C70 120 110 80 170 30" stroke="#0A3D59" strokeOpacity="0.12" strokeWidth="3" />
    </svg>
  );
}
