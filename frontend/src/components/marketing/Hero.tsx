"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { LinkButton } from "@/components/ui/LinkButton";
import { useAuth } from "@/hooks/useAuth";

export function Hero() {
  const { status, user } = useAuth();
  const signedIn = status === "authenticated";
  const firstName = user?.displayName?.trim().split(/\s+/)[0];

  return (
    <section className="relative isolate overflow-hidden bg-[#f6f7ef]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_15%,rgba(203,226,204,.5),transparent_42%),linear-gradient(180deg,#f8f8f1,#eef4e9)]" aria-hidden="true" />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[650px] lg:grid-cols-[.9fr_1.1fr] lg:gap-12 lg:px-10 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }} className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-white/75 px-3.5 py-2 text-xs font-semibold text-primary-700 shadow-sm sm:text-sm">
            <Sparkles className="size-4" aria-hidden="true" /> A gentler way to care for yourself
          </span>
          <h1 className="mt-6 max-w-[12ch] text-[clamp(2.7rem,8vw,5.2rem)] leading-[.99] font-semibold tracking-[-.055em] text-heading">
            {signedIn && firstName ? <>Welcome back, {firstName}.</> : <>Make room for <span className="text-primary-600">wellness.</span></>}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-body sm:text-lg sm:leading-8">
            {signedIn ? "Pick up where you left off, or find a practice for the moment you’re in." : "Find a yoga practice, take a mindful breath, or let calming sounds reset your day. Start exploring, no account needed."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <LinkButton href={signedIn ? "/dashboard" : "/yoga"} size="lg" className="w-full justify-center sm:w-auto">
              {signedIn ? "Resume your practice" : "Explore the library"}<ArrowRight className="size-4" aria-hidden="true" />
            </LinkButton>
            <Link href="/breathing" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-heading transition-colors hover:bg-white/70">
              <span className="flex size-7 items-center justify-center rounded-full bg-white text-primary-700"><Play className="size-3" fill="currentColor" aria-hidden="true" /></span> Try a breathing exercise
            </Link>
          </div>
          <p className="mt-5 text-xs font-medium text-muted">Free to explore · Practices for every level</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .65, delay: .1 }} className="relative mx-auto w-full max-w-2xl lg:ml-auto">
          <div className="relative aspect-[1.18/1] overflow-hidden rounded-[1.75rem] shadow-[0_32px_80px_-36px_rgba(21,64,45,.38)] sm:aspect-[1.35/1] sm:rounded-[2.25rem]">
            <Image src="/yoga.png" alt="A person sitting quietly beside a mountain lake at sunrise" fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10281f]/65 via-transparent to-white/5" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
              <p className="text-xs font-semibold tracking-[.16em] text-white/75 uppercase">Your practice, your pace</p>
              <p className="mt-2 max-w-sm text-xl leading-tight font-medium tracking-tight sm:text-2xl">A little time for yourself can change the shape of a day.</p>
            </div>
          </div>
          <div className="absolute -bottom-5 right-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur sm:right-8 sm:-bottom-6 sm:px-5">
            <p className="text-xs text-muted">Begin anywhere</p><p className="mt-0.5 text-sm font-semibold text-heading">Move · Breathe · Rest</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
