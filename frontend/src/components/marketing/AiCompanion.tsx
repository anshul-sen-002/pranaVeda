"use client";

import { motion } from "motion/react";
import { Bot, ShieldCheck, Sparkles } from "lucide-react";

import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { useAuth } from "@/hooks/useAuth";

/**
 * AI wellness companion showcase (agents.md 2.14).
 *
 * Honest framing throughout: the companion is educational, grounded in the
 * library, and never a doctor. The chat preview is a static mock of the real
 * contract (POST /api/v1/ai/chat) so the marketing never promises UI the app
 * does not have. Requires an account - the backend gates /api/v1/ai/**.
 */
const bubbles = [
  { from: "you" as const, text: "Which gentle poses help me unwind before sleep?" },
  {
    from: "ai" as const,
    text: "Try Child's Pose for 2 minutes, then Legs-Up-the-Wall for 5. Both are in the library with breathing cues - and I'll link each step.",
  },
  { from: "you" as const, text: "Is this safe with a sore lower back?" },
  {
    from: "ai" as const,
    text: "Go gently and stop if anything hurts. Skip deep forward folds tonight - here's a supported variation instead. I'm educational only, not medical advice.",
  },
];

export function AiCompanion() {
  const { status } = useAuth();
  const signedIn = status === "authenticated";

  return (
    <section className="border-y border-border-soft bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="AI wellness companion"
            title="Ask, learn, and find your next pose"
            lede="A calm assistant grounded in PranaVeda's own library. It explains poses, suggests routines for your goals, and always says when it isn't sure - never diagnosing, never prescribing."
          />

          <ul className="mt-8 space-y-4">
            {[
              { icon: Sparkles, title: "Grounded answers", body: "Recommendations link back to library poses you can open and practice." },
              { icon: ShieldCheck, title: "Safety first", body: "Contraindications, beginner variations, and clear stop-if-it-hurts cues." },
              { icon: Bot, title: "Private by design", body: "Chats stay yours. History is saved only for you, and you can delete it." },
            ].map((item, index) => (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-3.5"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-heading">{item.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-body">{item.body}</span>
                </span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <LinkButton href={signedIn ? "/dashboard" : "/register"} size="lg" className="sm:w-auto">
              {signedIn ? "Open your companion" : "Try it with a free account"}
            </LinkButton>
            <p className="text-xs font-medium text-muted">Requires an account · educational only</p>
          </div>
        </div>

        {/* Static chat preview - mock of the real chat contract */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          role="img"
          aria-label="Preview of an AI companion conversation about gentle bedtime poses"
          className="rounded-3xl border border-border-soft bg-surface-tint p-5 shadow-[0_24px_60px_-40px_rgba(29,111,84,0.5)] sm:p-6"
        >
          <div className="flex items-center gap-2.5 border-b border-border-soft pb-4">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-gradient-primary text-white">
              <Bot className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-heading">Prana companion</p>
              <p className="flex items-center gap-1.5 text-xs text-success">
                <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                Grounded in the library
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pt-5">
            {bubbles.map((bubble, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.35, delay: 0.15 + index * 0.12 }}
                className={bubble.from === "you" ? "flex justify-end" : "flex justify-start"}
              >
                <p
                  className={
                    bubble.from === "you"
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-gradient-primary px-4 py-2.5 text-sm leading-relaxed text-white"
                      : "max-w-[85%] rounded-2xl rounded-bl-md border border-border-soft bg-surface px-4 py-2.5 text-sm leading-relaxed text-body"
                  }
                >
                  {bubble.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
