"use client";
import { motion } from "motion/react";
import { LinkButton } from "@/components/ui/LinkButton";
import { LeafSprig } from "@/components/brand/Botanical";
import { useAuth } from "@/hooks/useAuth";

/** Closing banner from mockup 1 — sky-blue gradient, hidden when signed in. */
export function HomeCta() {
  const { status } = useAuth();
  if (status === "authenticated") return null;
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 px-7 py-12 text-center sm:px-12">
        <LeafSprig className="pointer-events-none absolute bottom-2 left-4 h-28 w-20 text-white/30" />
        <LeafSprig flip className="pointer-events-none absolute top-2 right-4 h-28 w-20 text-white/25" />
        <div className="relative mx-auto max-w-xl text-white">
          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Your practice, your pace, your peace</h2>
          <p className="mt-3 text-sm leading-relaxed text-primary-50/90">Join PranaVeda and take the first step towards a healthier, happier you.</p>
          <div className="mt-7 flex justify-center"><LinkButton href="/register" size="lg" variant="secondary">Get Started Free</LinkButton></div>
        </div>
      </motion.div>
    </section>
  );
}
