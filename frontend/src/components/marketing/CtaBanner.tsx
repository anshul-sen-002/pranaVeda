"use client";

import { motion } from "motion/react";

import { Logo } from "@/components/brand/Logo";
import { LinkButton } from "@/components/ui/LinkButton";
import { useAuth } from "@/hooks/useAuth";

/** Closing call-to-action. Only nudges sign-up for anonymous visitors. */
export function CtaBanner() {
  const { status } = useAuth();
  if (status === "authenticated") return null;

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 px-7 py-12 text-center sm:px-12 sm:py-16"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-16 -left-10 size-64 rounded-full bg-white/12 blur-3xl" />
          <div className="absolute -right-12 bottom-0 size-72 rounded-full bg-primary-200/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-xl text-white">
          <div className="flex justify-center">
            <Logo markOnly />
          </div>

          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Your practice, kept private and personal
          </h2>
          <p className="mt-4 text-base leading-relaxed text-primary-50/90">
            Create a free account to save routines, follow your streaks, and get
            recommendations that fit your own goals.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/register" size="lg" variant="secondary" className="sm:w-auto">
              Create free account
            </LinkButton>
            <LinkButton href="/login" size="lg" variant="ghost" className="text-white hover:bg-white/15 sm:w-auto">
              I already have one
            </LinkButton>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
