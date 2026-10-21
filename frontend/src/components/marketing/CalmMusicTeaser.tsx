"use client";

import { motion } from "motion/react";
import { AudioLines, MoonStar, Pause, Play, Waves } from "lucide-react";
import { useState } from "react";

import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { cn } from "@/lib/cn";

/**
 * Calm music teaser (agents.md 2.12).
 *
 * A still, honest preview: category chips plus a decorative player card. The
 * fake play button toggles locally as a visual demo only - real playback
 * arrives with the /calm-music route and its audio studio. Browsing and
 * streaming stay free; downloads need an account.
 */
const categories = ["Rain", "Ocean waves", "Forest", "Singing bowls", "Sleep ambience", "Focus"];

const bars = [38, 62, 45, 78, 55, 90, 66, 48, 72, 58, 84, 42, 68, 52, 76, 60];

export function CalmMusicTeaser() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="border-y border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Calm music studio"
            title="Soundscapes for practice, rest, and sleep"
            lede="Rain, ocean, forest air, singing bowls, and sleep ambience. Stream freely while you browse - your favourites and history wait after sign-in."
          />

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Audio categories">
            {categories.map((category) => (
              <li
                key={category}
                className="rounded-full border border-border-soft bg-surface-tint px-3.5 py-1.5 text-xs font-medium text-body"
              >
                {category}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <LinkButton href="/calm-music" size="lg" className="sm:w-auto">
              Explore calm music
            </LinkButton>
            <p className="text-xs font-medium text-muted">Free to stream · sleep timer included</p>
          </div>
        </div>

        {/* Decorative player card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-border-soft bg-surface-tint p-6 sm:p-7"
        >
          <div className="flex items-center gap-4">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-white">
              <Waves className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-heading">Midnight rain on leaves</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                <MoonStar className="size-3.5" aria-hidden="true" />
                Sleep ambience · 45 min loop
              </p>
            </div>
          </div>

          {/* Equaliser bars - gently animated unless reduced motion */}
          <div className="mt-6 flex h-16 items-end gap-1.5" aria-hidden="true">
            {bars.map((height, index) => (
              <motion.span
                key={index}
                className={cn("w-full rounded-full", playing ? "bg-primary-500" : "bg-primary-200")}
                initial={{ height: `${height * 0.35}%` }}
                animate={playing ? { height: [`${height * 0.35}%`, `${height}%`, `${height * 0.35}%`] } : undefined}
                transition={playing ? { duration: 1.4, repeat: Infinity, delay: (index % 5) * 0.12, ease: "easeInOut" } : undefined}
                style={!playing ? { height: `${height * 0.5}%` } : undefined}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              aria-pressed={playing}
              aria-label={playing ? "Pause preview animation" : "Play preview animation"}
              className="inline-flex size-12 items-center justify-center rounded-full bg-gradient-primary text-white shadow-[0_12px_28px_-12px_rgba(23,137,199,0.7)] transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              {playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="ml-0.5 size-5" aria-hidden="true" />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-primary-100">
                <div className={cn("h-full rounded-full bg-gradient-primary transition-all duration-500", playing ? "w-2/3" : "w-1/3")} />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                <AudioLines className="size-3.5" aria-hidden="true" />
                {playing ? "Visual preview - real audio on the music page" : "Tap play for a visual preview"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
