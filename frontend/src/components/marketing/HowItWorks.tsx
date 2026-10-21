"use client";

import { motion } from "motion/react";
import { Compass, PlayCircle, TrendingUp } from "lucide-react";

import { SectionHeading } from "@/components/marketing/SectionHeading";

/**
 * "How PranaVeda works" - three honest steps. No account needed for step one;
 * the personal side unlocks after sign-in. Steps cascade in on scroll.
 */
const steps = [
  {
    icon: Compass,
    step: "Step 1",
    title: "Browse freely",
    body: "Explore asanas, articles, videos, and calm audio. Search by goal, difficulty, or duration - no account, no paywall on browsing.",
  },
  {
    icon: PlayCircle,
    step: "Step 2",
    title: "Practice at your pace",
    body: "Follow guided sessions with timers, breathing cues, and rest intervals. Stop anytime - progress is encouraging, never punishing.",
  },
  {
    icon: TrendingUp,
    step: "Step 3",
    title: "Make it yours",
    body: "Sign in to save favourites, build routines, track streaks, and chat with the AI companion about your goals.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24 bg-gradient-to-b from-primary-50/30 via-transparent to-primary-50/30">
      <SectionHeading
        eyebrow="How it works"
        title="From curious visitor to steady practice"
        lede="Start without an account. Stay for the personal side when you're ready - every step respects your pace."
        align="center"
      />

      <ol className="relative mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((item, index) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-border-soft bg-surface p-6 sm:p-7"
          >
            <span className="absolute top-6 right-6 text-4xl font-semibold text-primary-100 select-none" aria-hidden="true">
              {index + 1}
            </span>
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-primary text-white">
              <item.icon className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-5 text-xs font-semibold tracking-[0.12em] text-primary-600 uppercase">{item.step}</p>
            <h3 className="mt-1.5 text-lg font-semibold text-heading">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-body">{item.body}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
