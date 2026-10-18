"use client";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Camera,
  Flame,
  Headphones,
  HeartPulse,
  Library,
  ShieldCheck,
  Sparkles,
  Wind,
} from "lucide-react";

import { LeafSprig } from "@/components/brand/Botanical";

const tiles = [
  {
    icon: Wind,
    t: "Guided Breathing",
    b: "Calm visual breathing exercises with adjustable timings and optional audio. Pause any time — it never rushes you.",
    href: "/breathing",
  },
  {
    icon: Camera,
    t: "Posture Coach",
    b: "Point your camera for live, on-device pose guidance. Frames stay in your browser — nothing is uploaded.",
    href: "/yoga",
  },
  {
    icon: Flame,
    t: "Streaks & Challenges",
    b: "Gentle daily streaks and a 7-day challenge that encourage, never shame. The server tracks your progress.",
    href: "/dashboard/challenges",
  },
  {
    icon: HeartPulse,
    t: "Wellness Profile",
    b: "Record goals, mood and preferences to steer recommendations. Private to you, exportable, deletable.",
    href: "/dashboard/wellness",
  },
  {
    icon: Library,
    t: "Saved Library",
    b: "Bookmark poses, videos and calm tracks into one personal shelf that syncs across your devices.",
    href: "/dashboard/saved",
  },
  {
    icon: Headphones,
    t: "Calm Music Studio",
    b: "Meditation, nature ambience, singing bowls and sleep soundscapes with a persistent mini-player.",
    href: "/calm-music",
  },
];

/**
 * Expanded feature grid — surfaces the breadth of the platform beyond the
 * three headline cards in <HomeFeatures>. Tiles link straight into the app so
 * a curious visitor can jump in. Mobile-first: 1 → 2 → 3 columns.
 */
export function HomeFeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8" aria-label="More ways to practise">
      <p className="text-sm font-semibold text-heading">Inside PranaVeda</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
        A whole wellness studio, in your pocket
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body">
        From your first breath to your hundredth session — tools that grow with your practice.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((c, i) => (
          <motion.li
            key={c.t}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
          >
            <Link
              href={c.href}
              className="group relative block h-full overflow-hidden rounded-2xl border border-border-soft bg-surface p-5 transition-shadow hover:shadow-[0_14px_36px_-24px_rgba(23,137,199,0.5)] sm:p-6"
            >
              <LeafSprig className="pointer-events-none absolute -right-2 -bottom-4 h-24 w-18 text-primary-200" />
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <c.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-heading">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{c.b}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-700 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                Open <Sparkles className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border-soft bg-surface-tint p-5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary-600" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-body">
          <span className="font-medium text-heading">Privacy first.</span> Browsing and streaming
          are free with no account. Camera frames for the posture coach never leave your device, and
          your wellness data stays yours — export or delete it whenever you like.
        </p>
      </div>
    </section>
  );
}
