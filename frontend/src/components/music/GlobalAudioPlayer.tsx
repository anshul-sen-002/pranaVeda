"use client";

import type { ReactNode } from "react";
import { AudioPlayerProvider } from "@/components/music/PlayerProvider";
import { MiniPlayer } from "@/components/music/MiniPlayer";

/** Keeps the single audio element and its controls alive across navigation. */
export function GlobalAudioPlayer({ children }: { children: ReactNode }) {
  return (
    <AudioPlayerProvider>
      {children}
      <MiniPlayer />
    </AudioPlayerProvider>
  );
}
