import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Calm Music | PranaVeda",
  description: "Relax your mind with curated meditation, sleep, focus, and nature sounds.",
};

/** Playback state is provided by the root layout and survives route changes. */
export default function CalmMusicLayout({ children }: { children: ReactNode }) {
  return children;
}
