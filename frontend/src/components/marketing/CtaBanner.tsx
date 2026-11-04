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
    <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 px-5 py-10 text-center shadow-[0_24px_70px_-38px_rgba(15,67,47,.55)] sm:rounded-[2.25rem] sm:px-12 sm:py-16"
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
