"use client";

import { motion, useReducedMotion } from "motion/react";
import { Flame } from "lucide-react";

/**
 * Personal-side visual: a calm dashboard card drawn as animated SVG.
 *
 * A progress ring fills to 68%, seven streak dots light up in sequence, and
 * two small chips (minutes practiced, saved items) float gently. Pure
 * SVG + Motion - a few KB of code, no animation assets, always on-theme,
 * and still under reduced motion (agents.md 6).
 */
const dots = [true, true, true, true, true, false, false];

export function JourneyVisual() {
  const reduceMotion = useReducedMotion();
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      role="img"
      aria-label="Illustration of a practice dashboard showing weekly progress and a five-day streak"
      className="relative mx-auto w-full max-w-md rounded-3xl border border-border-soft bg-surface p-6 shadow-[0_24px_60px_-40px_rgba(29,111,84,0.5)] sm:p-8"
    >
      <div className="flex items-center gap-5">
        {/* progress ring */}
        <div className="relative size-28 shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="11" className="stroke-primary-100" />
            <motion.circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="11"
              strokeLinecap="round"
              stroke="url(#pv-ring)"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              whileInView={{ strokeDashoffset: circumference * (1 - 0.68) }}
              viewport={{ once: true, amount: 0.5 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            />
            <defs>
              <linearGradient id="pv-ring" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2f8b66" />
                <stop offset="1" stopColor="#1d6f54" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-heading">68%</span>
            <span className="text-[11px] font-medium text-muted">this week</span>
          </div>
        </div>

        {/* streak dots */}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-heading">
            <Flame className="size-4 text-accent-amber" aria-hidden="true" />
            5-day streak
          </p>
          <div className="mt-3 flex gap-1.5" aria-hidden="true">
            {dots.map((lit, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0.4, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={
                  reduceMotion ? { duration: 0 } : { duration: 0.3, delay: 0.4 + index * 0.09, ease: [0.22, 1, 0.36, 1] }
                }
                className={
                  lit
                    ? "size-3.5 rounded-full bg-gradient-primary shadow-[0_4px_10px_-4px_rgba(29,111,84,0.7)]"
                    : "size-3.5 rounded-full border border-dashed border-primary-200 bg-primary-50"
                }
              />
            ))}
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-muted">Gentle progress - missed days never shame you.</p>
        </div>
      </div>

      {/* floating chips */}
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 right-2 rounded-2xl border border-border-soft bg-surface px-4 py-2 shadow-[0_14px_30px_-18px_rgba(29,111,84,0.55)] sm:-right-5"
      >
        <p className="text-sm font-semibold text-heading">126 min</p>
        <p className="text-[11px] text-muted">practiced</p>
      </motion.div>
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute -bottom-4 left-2 rounded-2xl border border-border-soft bg-surface px-4 py-2 shadow-[0_14px_30px_-18px_rgba(29,111,84,0.55)] sm:-left-5"
      >
        <p className="text-sm font-semibold text-heading">12 saved</p>
        <p className="text-[11px] text-muted">poses &amp; tracks</p>
      </motion.div>
    </div>
  );
}
