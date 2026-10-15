"use client";

import { motion, useReducedMotion } from "motion/react";

import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

/**
 * Brand breathing orb - a bespoke vector visual for the hero.
 *
 * Concentric gradient rings expand on an 8-second inhale/exhale rhythm with
 * the lotus mark resting at the centre. Pure SVG + Motion: no network weight,
 * always on-theme, and it settles to a still image when the OS asks for
 * reduced motion (agents.md 6).
 */
export function BreathOrb({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="img"
      aria-label="Calm breathing visual: expanding rings around the PranaVeda lotus"
      className={cn("relative mx-auto aspect-square w-full max-w-md", className)}
    >
      {/* soft halo */}
      <div
        aria-hidden="true"
        className="absolute inset-6 rounded-full bg-gradient-to-br from-primary-100 via-surface to-primary-200/60 blur-sm"
      />

      {/* breathing rings */}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-2"
          style={{
            borderColor: ring === 0 ? "rgba(31,169,237,0.45)" : ring === 1 ? "rgba(69,192,245,0.32)" : "rgba(125,209,248,0.28)",
            margin: `${ring * 13}%`,
          }}
          animate={reduceMotion ? undefined : { scale: [1, 1.045, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: ring * 1.1 }}
        />
      ))}

      {/* centre lotus on a soft card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="flex size-28 items-center justify-center rounded-full border border-border-soft bg-surface shadow-[0_24px_60px_-30px_rgba(23,137,199,0.55)] sm:size-36"
        >
          <Logo markOnly />
        </motion.div>
      </div>

      {/* floating breath cue */}
      <motion.p
        aria-hidden="true"
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-border-soft bg-surface/90 px-4 py-1.5 text-xs font-medium tracking-wide whitespace-nowrap text-primary-700 shadow-sm backdrop-blur"
      >
        inhale · exhale
      </motion.p>
    </div>
  );
}
