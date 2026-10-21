"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Heart, Leaf, Sparkles } from "lucide-react";

import { LinkButton } from "@/components/ui/LinkButton";
import { StoneStack } from "@/components/brand/Botanical";

const principles = [
  {
    icon: Leaf,
    t: "Calm by design",
    b: "A quiet visual language, gentle motion and generous space. The app respects reduced-motion settings and never nags.",
  },
  {
    icon: Heart,
    t: "Accessible to everyone",
    b: "Read and practise without an account. Clear contrast, keyboard support and mobile-first layouts come as standard.",
  },
  {
    icon: Sparkles,
    t: "Grounded, not gimmicky",
    b: "Guidance is drawn from published content and reviewed cues. The AI assists and explains — it never diagnoses or prescribes.",
  },
];

/**
 * "About PranaVeda" — states what the project is and what it stands for.
 * Sits near the foot of the home page so a first-time visitor understands the
 * mission before the closing CTA.
 */
export function HomeAbout() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8" aria-label="About PranaVeda">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold text-heading">About PranaVeda</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
            Yoga and holistic wellness, made calm and open
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-body">
            PranaVeda brings together a public library of yoga poses, guided breathing, calming
            audio and an AI wellness companion — so anyone can start a practice for free, and sign
            in only when they want it to become personal.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-body">
            We built it on a simple promise: explore freely, keep your data private, and let
            progress feel encouraging rather than pressuring. No medical claims, no dark patterns —
            just a supportive space to return to, one breath at a time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/about" size="sm">
              Learn more
            </LinkButton>
            <LinkButton href="/safety" size="sm" variant="secondary">
              Safety &amp; privacy
            </LinkButton>
          </div>
        </div>

        <ul className="grid gap-4">
          {principles.map((p, i) => (
            <motion.li
              key={p.t}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="relative overflow-hidden rounded-2xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30 p-5 sm:p-6"
            >
              <StoneStack className="pointer-events-none absolute right-4 bottom-4 h-14 w-12 text-primary-200" />
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <p.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-heading">{p.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-body">{p.b}</p>
            </motion.li>
          ))}
        </ul>
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        Curious where to start?{" "}
        <Link href="/yoga" className="font-medium text-primary-700 underline-offset-4 hover:underline">
          Browse the pose library
        </Link>{" "}
        or{" "}
        <Link href="/breathing" className="font-medium text-primary-700 underline-offset-4 hover:underline">
          try a breathing exercise
        </Link>
        .
      </p>
    </section>
  );
}
