import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AudioPlayerProvider } from "@/components/music/PlayerProvider";

export const metadata: Metadata = {
  title: "Calm Music | PranaVeda",
  description: "Relax your mind with curated meditation, sleep, focus, and nature sounds.",
};

/** Player state is scoped to music routes and is stopped when leaving them. */
export default function CalmMusicLayout({ children }: { children: ReactNode }) {
  return (
    <AudioPlayerProvider>
      {children}
    </AudioPlayerProvider>
  );
}
