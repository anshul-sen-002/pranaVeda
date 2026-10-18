"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { audioApi } from "@/lib/api/audio";
import type { AudioTrackSummary } from "@/lib/api/types";

interface PlayerState {
  queue: AudioTrackSummary[];
  current: AudioTrackSummary | null;
  playing: boolean;
  elapsed: number;
  duration: number | null;
  loading: boolean;
  error: string | null;
  sleepMins: number | null;
  play: (track: AudioTrackSummary, queue?: AudioTrackSummary[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (secs: number) => void;
  setSleep: (mins: number | null) => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

/** Global calm-music player: one <audio> for the whole app. */
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<AudioTrackSummary[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sleepMins, setSleepMins] = useState<number | null>(null);
  const sleepAt = useRef<number | null>(null);

  const current = useMemo(() => queue.find((t) => t.id === currentId) ?? null, [queue, currentId]);

  const ensureEl = useCallback(() => {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "metadata";
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  const play = useCallback((track: AudioTrackSummary, nextQueue?: AudioTrackSummary[]) => {
    if (nextQueue) setQueue(nextQueue);
    else setQueue((q) => (q.some((t) => t.id === track.id) ? q : [...q, track]));
    setCurrentId(track.id);
    setElapsed(0); setDuration(track.durationSeconds); setError(null); setLoading(true);
  }, []);

  useEffect(() => {
    if (currentId == null) return;
    let cancelled = false;
    audioApi.bySlug(
      (queue.find((t) => t.id === currentId)?.slug) ?? "",
    ).then(
      (detail) => {
        if (cancelled || !detail.streamUrl) { if (!cancelled && !detail.streamUrl) { setError("This track is stream-only unavailable right now."); setLoading(false); setPlaying(false); } return; }
        const el = ensureEl();
        el.src = detail.streamUrl;
        el.onloadedmetadata = () => !cancelled && setDuration(el.duration || null);
        el.ontimeupdate = () => {
          if (cancelled) return;
          setElapsed(el.currentTime);
          if (sleepAt.current && Date.now() >= sleepAt.current) {
            el.pause(); setPlaying(false); sleepAt.current = null; setSleepMins(null);
          }
        };
        el.onended = () => {
          if (cancelled) return;
          setQueue((q) => {
            const i = q.findIndex((t) => t.id === currentId);
            const nxt = q[i + 1];
            if (nxt) setCurrentId(nxt.id);
            else setPlaying(false);
            return q;
          });
        };
        el.onerror = () => { if (!cancelled) { setError("Could not play this track. Check your connection."); setLoading(false); setPlaying(false); } };
        el.play().then(() => { if (!cancelled) { setPlaying(true); setLoading(false); } }).catch(() => { if (!cancelled) { setError("Playback was blocked. Tap play again."); setLoading(false); setPlaying(false); } });
      },
      () => { if (!cancelled) { setError("Could not load this track."); setLoading(false); setPlaying(false); } },
    );
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  useEffect(() => {
    const el = audioRef.current;
    return () => { el?.pause(); };
  }, []);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el || currentId == null) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { void el.play().then(() => setPlaying(true)).catch(() => setError("Playback was blocked. Tap play again.")); }
  }, [playing, currentId]);

  const step = useCallback((dir: 1 | -1) => {
    setQueue((q) => {
      const i = q.findIndex((t) => t.id === currentId);
      const nxt = q[i + dir];
      if (nxt) setCurrentId(nxt.id);
      return q;
    });
  }, [currentId]);

  const seek = useCallback((secs: number) => {
    const el = audioRef.current;
    if (el) { el.currentTime = Math.max(0, secs); setElapsed(el.currentTime); }
  }, []);

  const setSleep = useCallback((mins: number | null) => {
    setSleepMins(mins);
    sleepAt.current = mins == null ? null : Date.now() + mins * 60_000;
  }, []);

  const value: PlayerState = {
    queue, current, playing, elapsed, duration, loading, error, sleepMins,
    play, toggle, next: () => step(1), prev: () => step(-1), seek, setSleep,
  };
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within AudioPlayerProvider");
  return ctx;
}
