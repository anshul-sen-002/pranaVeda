"use client";

import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";

/**
 * Hand-built animated meditation illustration for the auth pages.
 *
 * A stylised figure in lotus pose (padmasana) with a breathing glow, a soft
 * ground pool, and drifting leaves. Everything is inline SVG + `motion`, so it
 * costs a few KB, always matches the sky-blue brand, and needs no network
 * request or third-party player. `useReducedMotion` collapses all animation to
 * a calm static pose for anyone who asks their system for less motion.
 *
 * This is decorative (aria-hidden) — the meaning is carried by the heading.
 */
export function MeditationIllustration({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  // Long, slow loops so it feels restful, never busy. `undefined` disables the
  // animation entirely when the visitor prefers reduced motion.
  const breathe: TargetAndTransition | undefined = reduce
    ? undefined
    : { scale: [1, 1.045, 1], transition: { duration: 7, repeat: Infinity, ease: "easeInOut" } };
  const bob: TargetAndTransition | undefined = reduce
    ? undefined
    : { y: [0, -5, 0], transition: { duration: 7, repeat: Infinity, ease: "easeInOut" } };

  return (
    <svg
      viewBox="0 0 440 380"
      className={className}
      fill="none"
      role="img"
      aria-label="A person meditating in lotus pose"
    >
      <defs>
        <radialGradient id="med-glow" cx="50%" cy="46%" r="50%">
          <stop offset="0%" stopColor="#f0f7f4" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#8fc1ad" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8fc1ad" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="med-top" x1="188" y1="176" x2="252" y2="266" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EAF6FC" />
        </linearGradient>
        <linearGradient id="med-mat" x1="80" y1="300" x2="360" y2="330" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8fc1ad" stopOpacity="0.55" />
          <stop offset="1" stopColor="#1d6f54" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="med-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#8fc1ad" />
          <stop offset="1" stopColor="#2f8b66" />
        </linearGradient>
      </defs>

      {/* Breathing halo behind the figure */}
      <motion.ellipse
        cx="220"
        cy="178"
        rx="150"
        ry="150"
        fill="url(#med-glow)"
        animate={breathe}
        style={{ originX: "220px", originY: "178px" }}
      />

      {/* Ground pool / mat */}
      <ellipse cx="220" cy="316" rx="150" ry="22" fill="url(#med-mat)" />
      <ellipse cx="220" cy="312" rx="96" ry="12" fill="#0d3c2d" opacity="0.06" />

      {/* Drifting leaves */}
      <motion.g
        animate={reduce ? undefined : { y: [0, -10, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "70px", originY: "120px" }}
      >
        <path d="M70 120c10-20 32-26 46-20-6 16-26 28-46 20Z" fill="url(#med-leaf)" opacity="0.7" />
        <path d="M70 120c14-2 30 4 40 14" stroke="#0d3c2d" strokeOpacity="0.15" strokeWidth="1.5" />
      </motion.g>
      <motion.g
        animate={reduce ? undefined : { y: [0, 12, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "372px", originY: "96px" }}
      >
        <path d="M372 96c-12-18-34-20-46-12 8 15 30 22 46 12Z" fill="url(#med-leaf)" opacity="0.6" />
      </motion.g>
      <motion.g
        animate={reduce ? undefined : { y: [0, -8, 0], x: [0, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M368 232c-12-14-32-14-42-4 10 12 30 16 42 4Z" fill="url(#med-leaf)" opacity="0.5" />
      </motion.g>

      {/* Meditating figure */}
      <motion.g animate={bob}>
        {/* Crossed legs (lotus base) */}
        <path
          d="M148 300c0-24 30-40 72-40s72 16 72 40c0 14-34 22-72 22s-72-8-72-22Z"
          fill="#FFFFFF"
          stroke="#CFE7F5"
          strokeWidth="2"
        />
        {/* Crossed shins detail */}
        <path d="M176 300c14-12 74-12 88 0" stroke="#CFE7F5" strokeWidth="2.5" strokeLinecap="round" />
        {/* Feet */}
        <ellipse cx="204" cy="304" rx="12" ry="8" fill="#EFCEAF" />
        <ellipse cx="236" cy="304" rx="12" ry="8" fill="#EFCEAF" />

        {/* Arms resting on knees, hands in gyana mudra */}
        <path
          d="M200 190c-24 8-40 40-46 74"
          stroke="#EFCEAF"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path
          d="M240 190c24 8 40 40 46 74"
          stroke="#EFCEAF"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <circle cx="152" cy="268" r="11" fill="#EFCEAF" />
        <circle cx="288" cy="268" r="11" fill="#EFCEAF" />

        {/* Torso in a soft white top */}
        <path
          d="M198 178q22-12 44 0l10 78q-32 12-64 0Z"
          fill="url(#med-top)"
          stroke="#CFE7F5"
          strokeWidth="2"
        />
        {/* Shoulders */}
        <path d="M204 180c8 8 24 8 32 0" stroke="#EFCEAF" strokeWidth="13" strokeLinecap="round" />

        {/* Neck + head */}
        <rect x="211" y="150" width="18" height="24" rx="8" fill="#EFCEAF" />
        <circle cx="220" cy="134" r="31" fill="#EFCEAF" />
        {/* Hair cap + top bun */}
        <path
          d="M189 134c0-20 14-32 31-32s31 12 31 32c-4-14-14-20-31-20s-27 6-31 20Z"
          fill="#2B3A47"
        />
        <circle cx="220" cy="96" r="13" fill="#2B3A47" />
        {/* Closed, serene eyes + a hint of a smile */}
        <path d="M206 134c3-4 9-4 12 0" stroke="#2B3A47" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M222 134c3-4 9-4 12 0" stroke="#2B3A47" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M214 148c4 3 8 3 12 0" stroke="#C98F63" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}
