"use client";

import { useReducedMotion } from "motion/react";

/** Small hook so non-motion components can respect OS reduced-motion too. */
export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false;
}
