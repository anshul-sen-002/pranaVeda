"use client";

import { motion } from "motion/react";

/**
 * Quiet trust band. These are product promises, not vanity metrics - every
 * line restates a guarantee from agents.md (free browsing, private data,
 * encouraging progress, educational AI) rather than inventing numbers.
 */
const promises = [
  { value: "Free", label: "to browse every pose, video, and soundscape" },
  { value: "Yours", label: "wellness data stays private to your account" },
  { value: "Kind", label: "streaks encourage - missed days never shame" },
  { value: "Honest", label: "AI says when unsure, never plays doctor" },
];

export function TrustBand() {
  return (
    <section aria-label="Our promises" className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {promises.map((promise, index) => (
          <motion.div
            key={promise.value + promise.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-border-soft bg-surface px-5 py-6 text-center"
          >
            <dt className="order-2 mt-2 block text-xs leading-relaxed text-body">{promise.label}</dt>
            <dd className="order-1 bg-gradient-primary bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
              {promise.value}
            </dd>
          </motion.div>
        ))}
      </dl>
    </section>
  );
}
