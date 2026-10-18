"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Wind } from "lucide-react";
import { cn } from "@/lib/cn";

export type PatternKey = "calm478" | "box" | "energize";
export const PATTERNS: Record<PatternKey, { label: string; hint: string; phases: { label: string; seconds: number }[] }> = {
  calm478: { label: "Calm 4-7-8", hint: "Inhale 4, hold 7, exhale 8.", phases: [{ label: "Inhale", seconds: 4 }, { label: "Hold", seconds: 7 }, { label: "Exhale", seconds: 8 }] },
  box: { label: "Box", hint: "4-4-4-4 steady focus.", phases: [{ label: "Inhale", seconds: 4 }, { label: "Hold", seconds: 4 }, { label: "Exhale", seconds: 4 }, { label: "Hold", seconds: 4 }] },
  energize: { label: "Lift", hint: "Inhale 4, exhale 4.", phases: [{ label: "Inhale", seconds: 4 }, { label: "Exhale", seconds: 4 }] },
};
export const DURATIONS = [1, 3, 5, 10];

export function BreathingStudio() {
  const [pattern, setPattern] = useState<PatternKey>("calm478");
  const [minutes, setMinutes] = useState(3);
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseLeft, setPhaseLeft] = useState(4);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const phases = PATTERNS[pattern].phases;
  const totalSecs = minutes * 60;
  useEffect(() => {
    setPhaseIdx(0); setPhaseLeft(PATTERNS[pattern].phases[0].seconds);
    setElapsed(0); setDone(false); setRunning(false);
  }, [pattern, minutes]);
  useEffect(() => {
    if (!running) return;
    if (elapsed >= totalSecs) { setRunning(false); setDone(true); return; }
    const t = setTimeout(() => {
      setElapsed((e) => e + 1);
      setPhaseLeft((left) => {
        if (left > 1) return left - 1;
        const next = (phaseIdx + 1) % phases.length;
        setPhaseIdx(next);
        return phases[next].seconds;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [running, elapsed, phaseIdx, phases, totalSecs]);
  const phase = phases[phaseIdx];
  const totalProgress = Math.min(1, elapsed / Math.max(1, totalSecs));
  const stop = () => { setRunning(false); setPhaseIdx(0); setPhaseLeft(phases[0].seconds); setElapsed(0); setDone(false); };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section aria-label="Breathing exercise" className="rounded-3xl border border-border-soft bg-surface p-6 text-center sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary-700"><Wind className="size-4" aria-hidden="true" />{PATTERNS[pattern].label}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{PATTERNS[pattern].hint}</p>
        <div className="relative mx-auto mt-6 flex aspect-square w-full max-w-[240px] items-center justify-center" role="img" aria-label={`${phase.label}, ${phaseLeft} seconds remaining`}>
          <div aria-hidden="true" className="absolute inset-4 rounded-full bg-gradient-to-br from-primary-100 via-surface to-primary-200/60 blur-sm" />
          <div className="relative rounded-full border border-border-soft bg-surface px-7 py-5 shadow-[0_24px_60px_-30px_rgba(23,137,199,0.55)]">
            <p className="text-xl font-semibold text-heading">{phase.label}</p>
            <p className="mt-1 text-4xl font-semibold text-primary-700 tabular-nums" aria-live="polite">{phaseLeft}</p>
          </div>
        </div>
        <div className="mx-auto mt-5 h-1.5 max-w-xs overflow-hidden rounded-full bg-primary-100" aria-hidden="true"><div className="h-full rounded-full bg-primary-500" style={{ width: `${totalProgress * 100}%` }} /></div>
        <p className="mt-2 text-xs text-muted tabular-nums">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} of {minutes}:00{done ? " · Complete." : ""}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {!running ? (
            <button type="button" onClick={() => { setDone(false); setRunning(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-600 px-6 text-sm font-semibold text-white hover:bg-primary-700"><Play className="size-4" aria-hidden="true" />{elapsed > 0 && !done ? "Resume" : "Start"}</button>
          ) : (
            <button type="button" onClick={() => setRunning(false)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-600 px-6 text-sm font-semibold text-white hover:bg-primary-700"><Pause className="size-4" aria-hidden="true" />Pause</button>
          )}
          <button type="button" onClick={stop} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-soft px-5 text-sm font-medium text-heading hover:border-primary-300"><RotateCcw className="size-4" aria-hidden="true" />Stop</button>
        </div>
        <p className="mt-3 text-xs text-muted">You can stop any exercise at any time.</p>
      </section>
      <aside className="space-y-4">
        <section aria-label="Pattern" className="rounded-3xl border border-border-soft bg-surface p-5">
          <h2 className="text-sm font-semibold text-heading">Pattern</h2>
          <div className="mt-3 space-y-2" role="radiogroup" aria-label="Breathing pattern">
            {(Object.keys(PATTERNS) as PatternKey[]).map((k) => (
              <button key={k} type="button" role="radio" aria-checked={pattern === k} onClick={() => setPattern(k)} className={cn("w-full rounded-2xl border px-4 py-2.5 text-left", pattern === k ? "border-primary-400 bg-primary-50" : "border-border-soft")}>
                <span className="block text-sm font-semibold text-heading">{PATTERNS[k].label}</span>
                <span className="block text-xs text-muted">{PATTERNS[k].hint}</span>
              </button>
            ))}
          </div>
        </section>
        <section aria-label="Duration" className="rounded-3xl border border-border-soft bg-surface p-5">
          <h2 className="text-sm font-semibold text-heading">Duration</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button key={d} type="button" aria-pressed={minutes === d} onClick={() => setMinutes(d)} className={cn("min-h-10 rounded-full px-4 text-sm font-medium", minutes === d ? "bg-primary-600 text-white" : "bg-surface-tint text-body")}>{d} min</button>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}