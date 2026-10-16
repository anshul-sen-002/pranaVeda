"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Bot, HeartHandshake, Music4, PersonStanding } from "lucide-react";
import { LeafSprig } from "@/components/brand/Botanical";
import { MeditationIllustration } from "@/components/brand/MeditationIllustration";
import { LinkButton } from "@/components/ui/LinkButton";
import { useAuth } from "@/hooks/useAuth";

/** Mockup 1 hero in sky-blue: copy left, rounded visual right. */
export function HomeHero() {
  const { status, user } = useAuth();
  const signedIn = status === "authenticated";
  const first = user?.displayName?.trim().split(/\s+/)[0];
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-32 left-1/4 size-[26rem] rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute -right-24 top-24 size-[22rem] rounded-full bg-primary-300/30 blur-3xl" />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-12 pb-14 sm:px-8 lg:grid-cols-[1.02fr_0.98fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
          <p className="text-[13px] font-medium text-body">Your journey to a calmer, healthier you</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-balance text-heading sm:text-5xl">
            {signedIn && first ? <>Welcome back, {first}. Let&apos;s breathe.</> : <>Find your calm, <span className="bg-gradient-primary bg-clip-text text-transparent">move with intention.</span></>}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-body">Discover yoga poses, guided practices, calming sounds, and personalized wellness guidance — all in one peaceful space.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href={signedIn ? "/dashboard" : "/yoga"} size="lg">Explore Yoga Poses <ArrowRight className="size-4" aria-hidden="true" /></LinkButton>
            <LinkButton href={signedIn ? "/dashboard" : "/register"} size="lg" variant="secondary"><Bot className="size-4" aria-hidden="true" /> Meet Your AI Guide</LinkButton>
          </div>
          <div className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-border-soft pt-6">
            {[{ icon: PersonStanding, l: "Yoga Poses" }, { icon: HeartHandshake, l: "Guided Practice" }, { icon: Music4, l: "Meditation & Sounds" }].map((s) => (
              <div key={s.l} className="flex items-center gap-2"><span className="inline-flex size-9 items-center justify-center rounded-full bg-primary-50 text-primary-600"><s.icon className="size-4" aria-hidden="true" /></span><span className="text-xs font-medium text-body">{s.l}</span></div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted"><Link href="/yoga" className="font-medium text-primary-700 underline-offset-4 hover:underline">Browse free</Link> — no account needed.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative overflow-hidden rounded-[2rem] border border-border-soft bg-gradient-to-br from-surface via-primary-50 to-surface-tint-2 p-6 sm:p-8">
          <LeafSprig className="pointer-events-none absolute top-3 left-3 h-28 w-20 text-primary-400" />
          <LeafSprig flip className="pointer-events-none absolute right-3 bottom-3 h-28 w-20 text-primary-300" />
          <MeditationIllustration className="relative mx-auto h-auto w-full max-w-sm" />
          <div className="relative mx-auto -mt-2 flex max-w-sm items-center justify-between gap-3">
            <span className="rounded-full border border-border-soft bg-surface/90 px-3 py-1.5 text-xs font-medium text-body shadow-sm">Beginner friendly</span>
            <span className="rounded-full border border-border-soft bg-surface/90 px-3 py-1.5 text-xs font-medium text-body shadow-sm">5 min resets</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
