"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { Bookmark, Compass, Music4, Sparkles } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { LeafSprig, StoneStack } from "@/components/brand/Botanical";

const cards = [
  { icon: Compass, t: "Explore", b: "Browse yoga poses, filter by level, focus area and more. Follow step-by-step guidance with images and tips.", cta: "Explore Poses", href: "/yoga" },
  { icon: Bookmark, t: "Practice", b: "Try guided practices, breathing exercises, meditation and calming sounds to relax your mind and body.", cta: "Start Practice", href: "/yoga" },
  { icon: Sparkles, t: "Personalize", b: "Track your progress, save your favorite poses, and get personalized wellness suggestions.", cta: "Create Your Plan", href: "/dashboard" },
];

/** Key-features trio + AI + music rows from mockup 1, sky-blue themed. */
export function HomeFeatures() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8" aria-label="Key features">
      <p className="text-sm font-semibold text-heading">Key Features</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">Everything you need for your wellness journey</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body">Explore poses, practice mindfulness, get AI guidance and more — all in one place.</p>
      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {cards.map((c, i) => (
          <motion.li key={c.t} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45, delay: i * 0.06 }} className="relative overflow-hidden rounded-2xl border border-border-soft bg-surface p-6">
            <LeafSprig className="pointer-events-none absolute -right-2 -bottom-4 h-28 w-20 text-primary-200" />
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><c.icon className="size-5" aria-hidden="true" /></span>
            <h3 className="mt-4 text-base font-semibold text-heading">{c.t}</h3>
            <p className="mt-2 min-h-[3.5rem] text-sm leading-relaxed text-body">{c.b}</p>
            <LinkButton href={c.href} size="sm" className="mt-4">{c.cta}</LinkButton>
          </motion.li>
        ))}
      </ul>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-surface p-6">
          <h3 className="text-base font-semibold text-heading">Your AI Wellness Guide</h3>
          <p className="mt-2 text-sm leading-relaxed text-body">Ask anything about your wellness, yoga poses, or daily routine. Get supportive, non-medical guidance whenever you need it.</p>
          <div className="mt-4 space-y-2">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary-100 px-4 py-2.5 text-sm text-primary-900">How can I reduce stress with yoga?</p>
            <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md border border-border-soft bg-surface-tint px-4 py-2.5 text-sm text-body">Try these 3 calming poses…</p>
          </div>
          <LinkButton href="/register" size="sm" className="mt-4">Chat Now</LinkButton>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border-soft bg-surface p-6">
          <StoneStack className="pointer-events-none absolute right-4 bottom-4 h-16 w-14 text-primary-300" />
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted"><Music4 className="size-3.5" aria-hidden="true" /> Sleep ambience · 45 min loop</p>
          <h3 className="mt-2 text-base font-semibold text-heading">Calming Sounds &amp; Meditation</h3>
          <p className="mt-2 text-sm leading-relaxed text-body">Relax your mind with soothing sounds, nature music and guided meditations.</p>
          <LinkButton href="/calm-music" size="sm" className="mt-4">Explore Sounds</LinkButton>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted">Browsing is free · <Link href="/login" className="font-medium text-primary-700 underline-offset-4 hover:underline">Sign in</Link> unlocks saves, streaks &amp; the AI guide.</p>
    </section>
  );
}
