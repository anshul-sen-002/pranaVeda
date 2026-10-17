"use client";

import { useEffect, useMemo, useState } from "react";

import { audioApi } from "@/lib/api/audio";
import type { AudioCategory, AudioTrackSummary } from "@/lib/api/types";

export const FILTERS: { value: AudioCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "MEDITATION", label: "Meditation" },
  { value: "SLEEP", label: "Sleep" },
  { value: "FOCUS", label: "Focus" },
  { value: "NATURE", label: "Nature Sounds" },
  { value: "SINGING_BOWLS", label: "Relaxation" },
  { value: "GUIDED_BREATHING", label: "Stress Relief" },
];

export const CATEGORY_LABEL: Record<AudioCategory, string> = {
  MEDITATION: "Meditation",
  NATURE: "Nature Sounds",
  SINGING_BOWLS: "Relaxation",
  SLEEP: "Sleep",
  FOCUS: "Focus",
  GUIDED_BREATHING: "Stress Relief",
};

export const CATEGORY_CHIP: Record<AudioCategory, string> = {
  MEDITATION: "bg-primary-100 text-primary-800",
  NATURE: "bg-success/15 text-success",
  SINGING_BOWLS: "bg-primary-100 text-primary-800",
  SLEEP: "bg-[#e6e2f8] text-[#5b4fa8]",
  FOCUS: "bg-[#fbeed0] text-[#8a6d1f]",
  GUIDED_BREATHING: "bg-[#fbe3f0] text-[#a24a7a]",
};

export function minutesOf(track: AudioTrackSummary): string {
  if (track.durationSeconds == null) return "—";
  return `${Math.round(track.durationSeconds / 60)} min`;
}

/** Live track state for the Calm Music page (backend is the source of truth). */
export function useTracks(filter: AudioCategory | "ALL") {
  const [tracks, setTracks] = useState<AudioTrackSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = filter === "ALL" ? audioApi.list(0, 24) : audioApi.listByCategory(filter, 0, 24);
    load.then(
      (page) => {
        if (cancelled) return;
        setTracks(page.content);
        setError(null);
        setLoading(false);
      },
      (err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load music.");
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const byId = useMemo(() => new Map(tracks.map((t) => [t.id, t])), [tracks]);
  return { tracks, byId, loading, error };
}
