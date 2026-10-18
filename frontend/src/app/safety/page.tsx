import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LotusMark } from "@/components/brand/LotusMark";

export const metadata: Metadata = {
  title: "Safety | PranaVeda",
  description:
    "How to practise yoga safely: when to stop, contraindications, and when to seek qualified care.",
};

const RULES = [
  {
    title: "Stop if it hurts",
    body: "Sharp pain, dizziness, numbness, or shortness of breath means stop right away. Ease out of the pose, rest, and breathe normally. Discomfort that fades with a gentler variation is different from pain — never push through pain.",
  },
  {
    title: "Read the safety notes first",
    body: "Every pose page lists safety precautions and modifications. If you are pregnant, recovering from injury or surgery, or managing a medical condition, read them carefully and check with a qualified professional before trying something new.",
  },
  {
    title: "Build gradually",
    body: "Begin with beginner-level poses and short sessions. Warm up, keep a stable surface nearby for balance poses, and avoid advanced backbends, inversions, or long holds until you have steady foundations.",
  },
  {
    title: "Practise environment",
    body: "Use a non-slip surface, clear space around your mat, keep water nearby, and avoid practising on a full stomach. If you feel faint, lie down with your knees bent and breathe normally.",
  },
];

export default function SafetyPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
        <div className="flex items-center gap-3">
          <LotusMark className="size-10 text-primary-500" />
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary-700 uppercase">
              Safety first
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-3xl">
              Practise safely
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-body">
          PranaVeda offers general yoga and wellness information only — never
          medical advice. These guidelines apply to every pose, breathing
          exercise, and session on the platform.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {RULES.map((r) => (
            <article
              key={r.title}
              className="rounded-3xl border border-border-soft bg-surface p-6"
            >
              <h2 className="font-semibold text-heading">{r.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-body">{r.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-3xl border border-danger/30 bg-danger/5 p-6">
          <h2 className="font-semibold text-danger">Seek qualified care</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-heading">
            For severe, sudden, or worsening symptoms — chest pain, trouble
            breathing, fainting, or signs of stroke — stop practising and seek
            urgent medical care. Never stop prescribed treatment because of
            something you read here or heard from the AI companion.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
