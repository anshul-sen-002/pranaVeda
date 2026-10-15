"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Browser speech narration via `window.speechSynthesis` (feature: guided yoga
 * pose with voice narration). No audio files, no TTS service - the device
 * reads the saved instruction text.
 *
 * Reliability design:
 * - `supported` is false when the API is missing; callers fall back to
 *   text-only mode instead of crashing.
 * - Voices load asynchronously in some browsers: we call `getVoices()` on
 *   mount AND subscribe to `voiceschanged`, re-emitting when the list changes.
 *   We only ever offer voices the device actually reports.
 * - Every `speak()` bumps a session token. Cancel/step-change/unmount bump it
 *   too, so `onend`/`onerror` from a *previous* utterance are ignored (stale
 *   callbacks can neither advance the slide nor clear state).
 * - `speak()` always cancels outstanding speech first, so rapid
 *   Previous/Next/Replay can never overlap narration.
 * - Errors are captured, not thrown: narration failure degrades to silent
 *   text and manual navigation keeps working.
 */

export interface VoiceOption {
  /** `SpeechSynthesisVoice.voiceURI` - stable per device/voice. */
  uri: string;
  name: string;
  /** BCP-47 tag, e.g. "hi-IN", "en-US". */
  lang: string;
  localService: boolean;
  default: boolean;
}

export interface UseSpeechSynthesisResult {
  /** False when `speechSynthesis` is unavailable -> text-only fallback. */
  supported: boolean;
  /** Device voices; may be empty before the browser finishes loading. */
  voices: VoiceOption[];
  speaking: boolean;
  paused: boolean;
  /** Human-readable narration error, if the last utterance failed. */
  error: string | null;
  /** Speaks `text`; cancels current speech first. No-op when unsupported/blank. */
  speak: (text: string, opts?: { voiceURI?: string | null; rate?: number; onEnd?: () => void }) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  clearError: () => void;
}

const toOption = (v: SpeechSynthesisVoice): VoiceOption => ({
  uri: v.voiceURI,
  name: v.name,
  lang: v.lang,
  localService: v.localService,
  default: v.default,
});

export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Monotonic token: only callbacks holding the CURRENT token may act.
  const sessionRef = useRef(0);
  const supportedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return; // unsupported: stay in text-only mode
    }
    supportedRef.current = true;
    setSupported(true);

    const synth = window.speechSynthesis;
    const loadVoices = () => {
      // Always refresh - browsers replace voice objects across events.
      setVoices(synth.getVoices().map(toOption));
    };
    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);
    // Some browsers populate voices without firing the event reliably.
    const retry = window.setTimeout(loadVoices, 700);

    return () => {
      window.clearTimeout(retry);
      synth.removeEventListener("voiceschanged", loadVoices);
      // Never leak speech past a route change/unmount.
      sessionRef.current += 1;
      synth.cancel();
    };
  }, []);

  const cancel = useCallback(() => {
    sessionRef.current += 1; // invalidates in-flight callbacks
    if (supportedRef.current) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setPaused(false);
  }, []);

  const speak = useCallback<UseSpeechSynthesisResult["speak"]>((text, opts = {}) => {
    if (!supportedRef.current) return;
    const trimmed = text?.trim();
    if (!trimmed) return;

    const synth = window.speechSynthesis;
    // Cancel first so two utterances can never play at once.
    synth.cancel();
    sessionRef.current += 1;
    const session = sessionRef.current;

    const utterance = new SpeechSynthesisUtterance(trimmed);
    const all = synth.getVoices();
    const chosen = opts.voiceURI ? all.find((v) => v.voiceURI === opts.voiceURI) : undefined;
    if (chosen) {
      utterance.voice = chosen;
      utterance.lang = chosen.lang;
    }
    if (opts.rate && opts.rate > 0) utterance.rate = opts.rate;

    utterance.onend = () => {
      if (session !== sessionRef.current) return; // stale - a newer speak/cancel won
      setSpeaking(false);
      setPaused(false);
      opts.onEnd?.(); // safe to advance only when this utterance is current
    };
    utterance.onerror = (event) => {
      if (session !== sessionRef.current) return;
      setSpeaking(false);
      setPaused(false);
      // "interrupted"/"canceled" are normal consequences of cancel().
      const reason = event.error;
      if (reason !== "interrupted" && reason !== "canceled") {
        setError("Narration could not play on this device. The text steps still work normally.");
      }
    };

    try {
      synth.speak(utterance);
      setSpeaking(true);
      setPaused(false);
      setError(null);
    } catch {
      // Defensive: some embedded browsers throw instead of firing onerror.
      setSpeaking(false);
      setError("Narration is unavailable on this device.");
    }
  }, []);

  const pause = useCallback(() => {
    if (!supportedRef.current) return;
    try {
      window.speechSynthesis.pause();
      setPaused(true);
    } catch {
      /* pause unsupported - ignore, user can replay */
    }
  }, []);

  const resume = useCallback(() => {
    if (!supportedRef.current) return;
    try {
      window.speechSynthesis.resume();
      setPaused(false);
    } catch {
      /* ignore */
    }
  }, []);

  return {
    supported,
    voices,
    speaking,
    paused,
    error,
    speak,
    cancel,
    pause,
    resume,
    clearError: useCallback(() => setError(null), []),
  };
}
