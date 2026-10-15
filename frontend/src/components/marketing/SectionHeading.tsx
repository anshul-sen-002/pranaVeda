"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  lede: string;
  align?: "left" | "center";
}

/**
 * Shared section heading so every marketing block opens with the same calm
 * rhythm: small eyebrow, clear title, one honest sentence.
 */
export function SectionHeading({ eyebrow, title, lede, align = "left" }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("max-w-2xl", centered && "mx-auto text-center")}
    >
      <p className="text-xs font-semibold tracking-[0.14em] text-primary-600 uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-heading sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-body">{lede}</p>
    </motion.div>
  );
}
