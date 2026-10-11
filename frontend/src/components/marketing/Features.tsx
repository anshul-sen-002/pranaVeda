"use client";

import { motion } from "motion/react";
import {
  Bookmark,
  CalendarCheck,
  Heart,
  Music4,
  Search,
  Wind,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Public = no account needed (agents.md 2.1). */
  requiresAccount: boolean;
}

const features: Feature[] = [
  {
    icon: Search,
    title: "Explore the library",
    body: "Browse asanas, articles, and videos by goal, difficulty, or duration — search and filter freely.",
    requiresAccount: false,
  },
  {
    icon: Wind,
    title: "Breathe with us",
    body: "Guided breathing exercises with a calm visual pace you can stop at any moment.",
    requiresAccount: false,
  },
  {
    icon: Music4,
    title: "Calm soundscapes",
    body: "Rain, forest, singing bowls, and sleep ambience to settle into your practice.",
    requiresAccount: false,
  },
  {
    icon: Bookmark,
    title: "Save what you love",
    body: "Build a personal library of the poses and tracks that work for you.",
    requiresAccount: true,
  },
  {
    icon: CalendarCheck,
    title: "Track your streaks",
    body: "Gentle, encouraging progress. Missed days never shame you.",
    requiresAccount: true,
  },
  {
    icon: Heart,
    title: "Your private profile",
    body: "Goals, experience level, and preferences — visible only to you.",
    requiresAccount: true,
  },
];

/**
 * Feature grid. The account requirement is labelled explicitly rather than
 * being implied, so visitors are never surprised by a sign-in prompt.
 * Cards stagger in for a calm cascade, and flatten when reduced-motion is set.
 */
export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
          Everything you need for a calmer practice
        </h2>
        <p className="mt-3 text-base leading-relaxed text-body">
          Browsing is always free. Signing in simply unlocks the personal side of
          PranaVeda.
        </p>
      </motion.div>

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <motion.li
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.45,
              delay: index * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group rounded-2xl border border-border-soft bg-surface p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_16px_40px_-28px_rgba(23,137,199,0.5)]"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors duration-300 group-hover:bg-primary-100">
              <feature.icon className="size-5" aria-hidden="true" />
            </span>

            <h3 className="mt-4 text-base font-semibold text-heading">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-body">{feature.body}</p>

            {feature.requiresAccount ? (
              <p className="mt-3 text-xs font-medium text-muted">Requires an account</p>
            ) : (
              <p className="mt-3 text-xs font-medium text-success">Free for everyone</p>
            )}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
