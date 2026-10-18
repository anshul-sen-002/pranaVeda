import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { BreathingStudio } from "@/components/breathing/BreathingStudio";

export const metadata: Metadata = {
  title: "Breathing | PranaVeda",
  description: "Guided breathing exercises with a calm visual pacer. Stop anytime.",
};

export default function BreathingPage() {
  return (
    <AppShell quote="Breathe in calm, breathe out tension.">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-heading sm:text-2xl">Breathing studio</h1>
        <p className="mt-0.5 max-w-md text-sm leading-relaxed text-body">A calm visual pacer with 4-7-8, box, and morning patterns.</p>
      </header>
      <div className="mt-4"><BreathingStudio /></div>
    </AppShell>
  );
}
