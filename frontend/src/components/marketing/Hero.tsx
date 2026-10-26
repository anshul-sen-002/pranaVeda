"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { BreathOrb } from "@/components/motion/BreathOrb";
import { LinkButton } from "@/components/ui/LinkButton";
import { useAuth } from "@/hooks/useAuth";

/**
 * Public hero.
 *
 * agents.md 2.1 is the driving rule here: anyone can browse without an account.
 * So the CTA changes based on the *already-resolved* auth state rather than
 * forcing a sign-in wall:
 *  - signed in  -> "Resume your practice" -> /dashboard
 *  - anonymous  -> "Get started"          -> /register
 *
 * While the session check is still pending we render the neutral (anonymous)
 * copy, so the hero is never blank for first-time visitors.
 */
export function Hero() {
  const { status, user } = useAuth();
  const signedIn = status === "authenticated";
  const firstName = user?.displayName?.trim().split(/\s+/)[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/40 via-surface-tint to-primary-100/40">
      {/* Decorative calm backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <motion.div
          className="absolute -top-32 left-1/4 size-[26rem] rounded-full bg-primary-200/40 blur-3xl"
          animate={{ y: [0, 22, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 top-24 size-[22rem] rounded-full bg-primary-300/30 blur-3xl"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Mobile logo */}
        <div className="mb-2 lg:hidden">
          <Logo />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-surface px-3.5 py-1.5 text-xs font-medium text-primary-700 shadow-sm">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Yoga, breath &amp; calm in one place
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-heading sm:text-5xl lg:text-6xl">
            {signedIn && firstName ? (
              <>Welcome back, {firstName}. Let&apos;s breathe.</>
            ) : (
              <>
                Find your calm,{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  one breath at a time
                </span>
                .
              </>
            )}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-body sm:text-lg">
            Explore asanas, guided breathing exercises, and soothing soundscapes
            — freely, with no account needed. Sign in when you&apos;re ready to
            save routines, track streaks, and make it yours.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <LinkButton
              href={signedIn ? "/dashboard" : "/register"}
              size="lg"
              className="sm:w-auto whitespace-nowrap"
            >
              {signedIn ? "Resume your practice" : "Get started"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </LinkButton>

            {signedIn ? null : (
              <LinkButton
                href="/login"
                size="lg"
                variant="secondary"
                className="sm:w-auto whitespace-nowrap"
              >
                Sign in
              </LinkButton>
            )}

            <Link
              href="/yoga"
              className="text-sm font-medium text-body underline-offset-4 transition-colors hover:text-primary-700 hover:underline sm:ml-2 whitespace-nowrap"
            >
              Browse content without an account
            </Link>
          </div>
        </motion.div>

        {/* Breathing orb visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <BreathOrb />
        </motion.div>
      </div>
    </section>
  );
}
