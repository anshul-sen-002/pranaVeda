"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Repeat,
  Settings2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import { useSpeechSynthesis, type VoiceOption } from "@/hooks/useSpeechSynthesis";
import type { ContentStep } from "@/lib/api/types";

/**
 * Guided pose slideshow with optional browser-voice narration (feature:
 * guided yoga pose with voice narration).
 *
 * - One image + its instruction at a time, with progress and Previous / Next /
 *   Replay / Pause-Resume / Exit controls.
 * - Narration starts only after "Start Practice" (a user gesture, so autoplay
 *   restrictions are respected) and re-speaks on step change; previous speech
 *   is always cancelled first so utterances never overlap.
 * - Voice/rate come from the device's own `getVoices()` list - we never
 *   promise a language the device does not offer. When speech is unsupported
 *   or fails, the text and manual navigation keep working.
 * - Optional auto-advance after narration ends, guarded by the speech hook's
 *   session token so a stale utterance can never move the slideshow.
 */

const RATE_MIN = 0.5;
const RATE_MAX = 2;
const RATE_STEP = 0.1;

interface GuidedPracticeProps {
  steps: ContentStep[];
  poseTitle: string;
}

/** Group voices by language tag so we only offer languages that exist. */
function groupByLang(voices: VoiceOption[]): Map<string, VoiceOption[]> {
  const map = new Map<string, VoiceOption[]>();
  for (const v of voices) {
    const list = map.get(v.lang) ?? [];
    list.push(v);
    map.set(v.lang, list);
  }
  return map;
}

export function GuidedPractice({ steps, poseTitle }: GuidedPracticeProps) {
  const speech = useSpeechSynthesis();
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [narrationOn, setNarrationOn] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [rate, setRate] = useState(1);
  const [voiceURI, setVoiceURI] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const total = steps.length;
  const step = steps[Math.min(index, total - 1)];

  // Mirrors of the latest settings for the utterance onEnd callback, so it
  // never acts on a stale toggle (e.g. auto-advance off mid-sentence).
  // Refs are synced in an effect - never written during render.
  const narrationRef = useRef(narrationOn);
  const autoAdvanceRef = useRef(autoAdvance);
  const indexRef = useRef(index);
  useEffect(() => {
    narrationRef.current = narrationOn;
    autoAdvanceRef.current = autoAdvance;
    indexRef.current = index;
  });

  const langs = useMemo(() => groupByLang(speech.voices), [speech.voices]);
  const langKeys = useMemo(() => [...langs.keys()].sort(), [langs]);

  const currentLang = useMemo(() => {
    if (voiceURI) {
      const found = speech.voices.find((v) => v.uri === voiceURI);
      if (found) return found.lang;
    }
    return langKeys[0] ?? null;
  }, [voiceURI, speech.voices, langKeys]);

  /** Speaks step `i`; its onEnd may advance to the next step. */
  const speakStep = useCallback(
    (i: number) => {
      const target = steps[i];
      if (!target?.instruction) return;
      speech.speak(target.instruction, {
        voiceURI,
        rate,
        onEnd: () => {
          if (!autoAdvanceRef.current || !narrationRef.current) return;
          const next = indexRef.current + 1;
          if (next < total) {
            goToRef.current(next);
          }
        },
      });
    },
    [steps, speech.speak, voiceURI, rate, total],
  );

  // Navigation lives behind a ref so speakStep's onEnd always calls the
  // latest closure (no stale-index jumps on rapid clicking).
  const goToRef = useRef<(i: number) => void>(() => {});
  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= total) return;
      speech.cancel(); // stop current narration before switching steps
      setIndex(i);
      if (narrationRef.current) speakStep(i);
    },
    [speech.cancel, speakStep, total],
  );
  useEffect(() => {
    goToRef.current = goTo;
  }, [goTo]);

  const start = () => {
    setActive(true);
    setIndex(0);
    indexRef.current = 0;
    // Explicit user gesture -> allowed to start narration immediately.
    if (narrationOn) speakStep(0);
  };

  const exit = () => {
    speech.cancel();
    setActive(false);
    setSettingsOpen(false);
  };

  // Escape exits the practice while it is open.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Never leak speech past an unmount/route change.
  useEffect(() => () => speech.cancel(), [speech.cancel]);

  const toggleNarration = () => {
    if (!speech.supported) return;
    if (narrationOn) {
      speech.cancel();
      setNarrationOn(false);
    } else {
      setNarrationOn(true);
      speakStep(index); // user gesture - safe to speak immediately
    }
  };

  if (total === 0) return null;

  const previewVoice = () => {
    // Explicit click = user gesture; a short sample sentence.
    speech.speak("This is how the guided narration will sound on your device.", {
      voiceURI,
      rate,
    });
  };

  return (
    <section
      aria-label={`Guided practice: ${poseTitle}`}
      className="rounded-2xl border border-border-soft bg-gradient-to-b from-surface via-primary-50/30 to-primary-100/30 p-5 sm:p-6"
    >
      {!active ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-heading">
              <Play className="size-5 text-primary-600" aria-hidden="true" />
              Guided practice
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {total} step{total === 1 ? "" : "s"}, with narration read aloud by your
              device{speech.supported ? "" : " (voice narration is not supported in this browser)"}
              . Nothing is recorded or uploaded.
            </p>
          </div>
          <button
            type="button"
            onClick={start}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-medium text-white shadow-[0_8px_20px_-8px_rgba(23,137,199,0.65)] transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
          >
            <Play className="size-4" aria-hidden="true" />
            Start Practice
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-heading" aria-live="polite" aria-atomic="true">
              Step {index + 1} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                aria-expanded={settingsOpen}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-soft px-3 text-xs font-medium text-muted transition-colors hover:border-primary-300 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <Settings2 className="size-3.5" aria-hidden="true" />
                Voice
              </button>
              <button
                type="button"
                onClick={exit}
                aria-label="Exit guided practice"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border-soft text-muted transition-colors hover:border-danger/40 hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-surface-tint"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={index + 1}
            aria-label="Practice progress"
          >
            <div
              className="h-full rounded-full bg-primary-500 transition-[width] duration-300"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>

          {settingsOpen ? (
            <VoiceSettings
              supported={speech.supported}
              voices={speech.voices}
              langKeys={langKeys}
              currentLang={currentLang}
              voiceURI={voiceURI}
              rate={rate}
              onLangChange={(lang) => setVoiceURI(langs.get(lang)?.[0]?.uri ?? null)}
              onVoiceChange={setVoiceURI}
              onRateChange={setRate}
              onPreview={previewVoice}
            />
          ) : null}

          {/* Current step: one image + its instruction at a time. */}
          <figure className="overflow-hidden rounded-2xl border border-border-soft">
            <img
              src={step.imageUrl}
              alt={step.caption ?? `${poseTitle} — step ${index + 1}`}
              className="aspect-[16/10] w-full object-cover"
            />
          </figure>

          {step.caption ? (
            <p className="text-sm font-medium text-heading">{step.caption}</p>
          ) : null}

          <p className="text-sm leading-relaxed whitespace-pre-line text-muted" aria-live="polite">
            {step.instruction ?? "No narration text for this step yet."}
          </p>

          {speech.error ? (
            <p role="alert" className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-heading">
              {speech.error}
            </p>
          ) : null}

          {/* Controls ---------------------------------------------------- */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-border-soft px-4 text-sm font-medium text-heading transition-colors hover:border-primary-300 hover:text-primary-700 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Previous
            </button>

            <button
              type="button"
              onClick={() => speakStep(index)}
              disabled={!speech.supported || !step.instruction}
              title={speech.supported ? "Replay this step's narration" : "Narration unsupported"}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-border-soft px-4 text-sm font-medium text-heading transition-colors hover:border-primary-300 hover:text-primary-700 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <Repeat className="size-4" aria-hidden="true" />
              Replay
            </button>

            {speech.supported ? (
              <button
                type="button"
                onClick={() => (speech.paused ? speech.resume() : speech.pause())}
                disabled={!speech.speaking && !speech.paused}
                aria-label={speech.paused ? "Resume narration" : "Pause narration"}
                className="inline-flex size-10 items-center justify-center rounded-full border border-border-soft text-heading transition-colors hover:border-primary-300 hover:text-primary-700 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                {speech.paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              </button>
            ) : null}

            <button
              type="button"
              onClick={toggleNarration}
              disabled={!speech.supported}
              aria-pressed={narrationOn}
              aria-label={narrationOn ? "Turn narration off" : "Turn narration on"}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border-soft text-heading transition-colors hover:border-primary-300 hover:text-primary-700 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              {narrationOn ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
            </button>

            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={index === total - 1}
              className="inline-flex h-10 items-center gap-1 rounded-full border border-border-soft px-4 text-sm font-medium text-heading transition-colors hover:border-primary-300 hover:text-primary-700 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              Next
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>

            <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="size-4 rounded border-border-soft accent-primary-600"
              />
              Auto-advance after narration
            </label>
          </div>

          <p className="text-xs text-muted">
            Spoken by your device&apos;s built-in voice. No audio is recorded, uploaded, or
            stored. Stop if anything hurts — never force a movement.
          </p>
        </div>
      )}
    </section>
  );
}




/** Device voice picker: language, voice, speed, preview (device-provided only). */
interface VoiceSettingsProps {
  supported: boolean;
  voices: VoiceOption[];
  langKeys: string[];
  currentLang: string | null;
  voiceURI: string | null;
  rate: number;
  onLangChange: (lang: string) => void;
  onVoiceChange: (uri: string | null) => void;
  onRateChange: (rate: number) => void;
  onPreview: () => void;
}

function VoiceSettings({
  supported,
  voices,
  langKeys,
  currentLang,
  voiceURI,
  rate,
  onLangChange,
  onVoiceChange,
  onRateChange,
  onPreview,
}: VoiceSettingsProps) {
  const selectClass =
    "h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-sm text-heading " +
    "focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-200";

  if (!supported) {
    return (
      <p className="rounded-xl bg-surface-tint px-4 py-3 text-sm text-muted">
        Voice narration is not available in this browser. You can still follow the
        written steps and use the controls.
      </p>
    );
  }

  if (voices.length === 0) {
    return (
      <p className="rounded-xl bg-surface-tint px-4 py-3 text-sm text-muted">
        No voices have been reported by this device yet. They usually appear within a
        moment — try again shortly.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-xl bg-surface-tint p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-heading">Language</span>
          <select
            className={selectClass}
            value={currentLang ?? ""}
            onChange={(e) => onLangChange(e.target.value)}
          >
            {langKeys.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-heading">Voice</span>
          <select
            className={selectClass}
            value={voiceURI ?? ""}
            onChange={(e) => onVoiceChange(e.target.value || null)}
          >
            <option value="">Device default</option>
            {voices
              .filter((v) => !currentLang || v.lang === currentLang)
              .map((v) => (
                <option key={v.uri} value={v.uri}>
                  {v.name}
                </option>
              ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 flex items-center justify-between font-medium text-heading">
          Speed
          <span className="text-xs font-normal text-muted">{rate.toFixed(1)}x</span>
        </span>
        <input
          type="range"
          min={RATE_MIN}
          max={RATE_MAX}
          step={RATE_STEP}
          value={rate}
          onChange={(e) => onRateChange(Number(e.target.value))}
          className="w-full accent-primary-600"
          aria-label="Narration speed"
        />
      </label>

      <button
        type="button"
        onClick={onPreview}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-soft bg-surface px-4 text-xs font-medium text-heading transition-colors hover:border-primary-300 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        <Volume2 className="size-3.5" aria-hidden="true" />
        Preview voice
      </button>

      <p className="text-xs text-muted">
        Voices come from your device and operating system. If Hindi or another language
        is not listed, install its speech pack in your system settings — we only show
        voices your device actually provides.
      </p>
    </div>
  );
}