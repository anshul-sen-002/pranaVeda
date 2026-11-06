"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { AudioPlayerProvider } from "@/components/music/PlayerProvider";
import { installExclusivePlayback } from "@/lib/media/exclusivePlayback";

/** Keeps music playback state across routes and enforces one active media source. */
export function MediaPlaybackProvider({ children }: { children: ReactNode }) {
  useEffect(() => installExclusivePlayback(), []);
  return <AudioPlayerProvider>{children}</AudioPlayerProvider>;
}
