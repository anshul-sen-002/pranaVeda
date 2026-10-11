"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";

/**
 * Split-screen shell for the login/register pages.
 *
 * Left: a calm animated sky panel (the brand's breathing motif).
 * Right: the form card on white.
 *
 * Motion notes:
 *  - Soft floating blobs use long, slow durations to feel restful.
 *  - The container staggers its children so the card eases in after the
 *    backdrop, rather than everything moving at once.
 *  - `motion` reads `prefers-reduced-motion` automatically, so on systems that
 *    request reduced motion these become plain static elements.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      {/* ---------------- Brand panel ---------------- */}
      <section
        className="relative hidden overflow-hidden bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 lg:block"
        aria-hidden="true"
      >
        <motion.div
          className="absolute -top-24 -left-16 size-80 rounded-full bg-white/15 blur-3xl"
          animate={{ x: [0, 28, 0], y: [0, 18, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-6rem] bottom-[-4rem] size-96 rounded-full bg-primary-200/25 blur-3xl"
          animate={{ x: [0, -24, 0], y: [0, -20, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 left-1/2 size-64 rounded-full bg-primary-100/20 blur-2xl"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Logo className="[&_span]:text-white [&_span.text-primary-600]:text-primary-100" />

          <div className="max-w-md text-white">
            <h2 className="text-3xl font-semibold tracking-tight text-balance xl:text-4xl">
              Begin your practice, one calm breath at a time.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-primary-50/90">
              Explore asanas, guided breathing, and soothing soundscapes. Sign in
              to save your routines, track your streaks, and keep your wellness
              journey private.
            </p>
          </div>

          <p className="text-xs text-primary-100/80">
            A calm space for yoga, mindfulness, and rest.
          </p>
        </div>
      </section>

      {/* ---------------- Form panel ---------------- */}
      <section className="flex min-h-dvh flex-col items-center justify-center px-5 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* On mobile the brand panel is hidden, so the logo lives here. */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>

          <div className="rounded-2xl border border-border-soft bg-surface p-7 shadow-[0_18px_50px_-32px_rgba(34,50,64,0.35)] sm:p-9">
            {children}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
