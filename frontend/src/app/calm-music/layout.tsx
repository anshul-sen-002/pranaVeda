import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AudioPlayerProvider } from "@/components/music/PlayerProvider";

export const metadata: Metadata = {
  title: "Calm Music | PranaVeda",
  description: "Relax your mind with curated meditation, sleep, focus, and nature sounds.",
};

/** Player provider wraps music routes so audio persists across navigation. */
export default function CalmMusicLayout({ children }: { children: ReactNode }) {
  return (
    <AudioPlayerProvider>
      {children}
    </AudioPlayerProvider>
  );
}