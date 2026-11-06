"use client";

import { motion, useReducedMotion } from "motion/react";
import { Flower2 } from "lucide-react";

import { Logo } from "@/components/brand/Logo";

/** Calm full-screen status overlay for auth bootstrap and dashboard loading. */
export function LoadingOverlay({
  title,
  description = "One moment while we get things ready.",
}: {
  title: string;
  description?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-busy="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.25 }}
      className="fixed inset-0 z-[100] grid min-h-dvh place-items-center overflow-hidden bg-[#f7f8f3] px-4"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-24 size-[28rem] rounded-full bg-emerald-200/35 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, 22, 0], y: [0, 16, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -bottom-40 size-[30rem] rounded-full bg-amber-100/55 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, -18, 0], y: [0, -14, 0], scale: [1.04, 1, 1.04] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={reduceMotion ? undefined : { y: 12, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex w-full max-w-sm flex-col items-center rounded-[2rem] border border-white/80 bg-white/75 px-7 py-9 text-center shadow-[0_28px_90px_-42px_rgba(25,67,47,.32)] backdrop-blur-2xl sm:px-10 sm:py-11"
      >
        <Logo />
        <div className="relative mt-8 flex size-[5.25rem] items-center justify-center">
          <motion.span
            aria-hidden="true"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[3px] border-primary-100 border-t-primary-600 border-r-primary-300"
          />
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <Flower2 className="size-6" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-6 text-base font-semibold text-heading">{title}</p>
        <p className="mt-1.5 max-w-[16rem] text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              animate={reduceMotion ? undefined : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.16, ease: "easeInOut" }}
              className="size-1.5 rounded-full bg-primary-500"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
