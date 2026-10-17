import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LotusMark } from "@/components/brand/LotusMark";

export const metadata: Metadata = {
  title: "About | PranaVeda",
  description: "What PranaVeda is, what it is not, and how to practise safely.",
};

const CARDS = [
  {
    title: "Anyone can explore",
    body: "Published yoga, calm audio, and safety pages are open to every visitor. Accounts only unlock personal features like saved libraries, dashboards, and progress.",
  },
  {
    title: "Gentle, never shaming",
    body: "Streaks and challenges encourage — they never punish. A missed day simply means completing more days, and every dashboard says so.",
  },
  {
    title: "Your data stays yours",
    body: "Wellness answers are optional, private to you, and never sent to the AI unless you opt in. Export and deletion options ship with every personal feature.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
        <div className="flex items-center gap-3">
          <LotusMark className="size-10 text-primary-500" />
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary-700 uppercase">About PranaVeda</p>
            <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
              Calm yoga and holistic wellness
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-body">
          PranaVeda is a quiet home for yoga practice: asanas with careful instructions, guided breathing,
          calming soundscapes, and an educational AI companion. It is a wellness practice space — not a medical
          service. Nothing here diagnoses, treats, or cures any condition, and the AI never recommends stopping
          prescribed treatment.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {CARDS.map((c) => (
            <article key={c.title} className="rounded-3xl border border-border-soft bg-surface p-6">
              <h2 className="font-semibold text-heading">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-body">{c.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-3xl border border-border-soft bg-primary-50/60 p-6">
          <h2 className="font-semibold text-heading">Practise safely</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body">
            Stop any pose or exercise that causes pain, dizziness, or shortness of breath. Poses with known
            contraindications carry safety notes on their detail pages — read them before trying something new.
            If you have an injury, a medical condition, or urgent symptoms, consult a qualified professional first.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
