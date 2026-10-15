"use client";

import { CalendarCheck, LayoutDashboard, Repeat2, Sparkles } from "lucide-react";

import { LinkButton } from "@/components/ui/LinkButton";
import { JourneyVisual } from "@/components/motion/JourneyVisual";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { useAuth } from "@/hooks/useAuth";

/**
 * Personal-side showcase: dashboard, routines, streaks.
 *
 * The LottieFiles illustration (people around screens and charts) visualises
 * the "your practice, visible" story - it plays only here, below the fold,
 * so first paint stays fast. Everything described maps to a real backend
 * surface (dashboard summary, routines, streaks/challenges).
 */
const points = [
  { icon: LayoutDashboard, title: "A dashboard that greets you", body: "Today's routine, minutes practiced, and saved items - one calm glance." },
  { icon: Repeat2, title: "Routines you build", body: "Save sequences, reorder poses, and run guided sessions with timers and cues." },
  { icon: CalendarCheck, title: "Streaks without shame", body: "Server-side streak math, 7-day challenges, and a kind missed-day policy." },
  { icon: Sparkles, title: "Recommendations that fit", body: "Suggestions drawn from your own activity and goals - never generic." },
];

export function PersonalSide() {
  const { status } = useAuth();
  const signedIn = status === "authenticated";

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <JourneyVisual />
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="When you sign in"
            title="Your practice, kept private and personal"
            lede="Everything personal stays yours - the backend enforces ownership on every record, so you can only ever see your own data."
          />

          <ul className="mt-8 space-y-5">
            {points.map((point) => (
              <li key={point.title} className="flex gap-3.5">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <point.icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-heading">{point.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-body">{point.body}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <LinkButton href={signedIn ? "/dashboard" : "/register"} size="lg" className="sm:w-auto">
              {signedIn ? "Go to your dashboard" : "Create a free account"}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
