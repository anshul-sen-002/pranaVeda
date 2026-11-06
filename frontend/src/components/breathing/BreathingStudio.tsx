"use client";

import { useEffect, useState } from "react";
import { Check, Pause, Play, RotateCcw, Wind } from "lucide-react";
import { cn } from "@/lib/cn";

export type PatternKey = "calm478" | "box" | "energize";
export const PATTERNS: Record<PatternKey, { label: string; hint: string; phases: { label: string; seconds: number }[] }> = {
  calm478: { label: "4–7–8 Relax", hint: "Inhale 4, hold 7, exhale 8.", phases: [{ label: "Inhale", seconds: 4 }, { label: "Hold", seconds: 7 }, { label: "Exhale", seconds: 8 }] },
  box: { label: "Box breathing", hint: "A steady 4–4–4–4 rhythm.", phases: [{ label: "Inhale", seconds: 4 }, { label: "Hold", seconds: 4 }, { label: "Exhale", seconds: 4 }, { label: "Hold", seconds: 4 }] },
  energize: { label: "Gentle energy", hint: "Inhale 4, exhale 4.", phases: [{ label: "Inhale", seconds: 4 }, { label: "Exhale", seconds: 4 }] },
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
    setPhaseIdx(0);
    setPhaseLeft(PATTERNS[pattern].phases[0].seconds);
    setElapsed(0);
    setDone(false);
    setRunning(false);
  }, [pattern, minutes]);

  useEffect(() => {
    if (!running) return;
    if (elapsed >= totalSecs) {
      setRunning(false);
      setDone(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setElapsed((value) => value + 1);
      setPhaseLeft((left) => {
        if (left > 1) return left - 1;
        const next = (phaseIdx + 1) % phases.length;
        setPhaseIdx(next);
        return phases[next].seconds;
      });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [running, elapsed, phaseIdx, phases, totalSecs]);

  const phase = phases[phaseIdx];
  const progress = Math.min(1, elapsed / Math.max(1, totalSecs));
  const orbScale = !running ? 1 : phase.label === "Inhale" ? 1.12 : phase.label === "Hold" ? 1.12 : 0.91;
  const stop = () => {
    setRunning(false);
    setPhaseIdx(0);
    setPhaseLeft(phases[0].seconds);
    setElapsed(0);
    setDone(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl min-w-0">
      <section aria-label="Breathing exercise" className="relative isolate overflow-hidden rounded-[2rem] border border-[#dce8d8] bg-[radial-gradient(ellipse_at_50%_20%,#fff_0%,#f8fbf5_44%,#edf5ed_100%)] px-4 py-6 text-center shadow-[0_24px_70px_-48px_rgba(48,103,72,.3)] sm:rounded-[2.5rem] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 size-80 -translate-x-1/2 rounded-full bg-[#dcebdc]/70 blur-3xl" aria-hidden="true" />
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-left"><span className="flex size-9 items-center justify-center rounded-full bg-white/80 text-[#357a58] shadow-sm"><Wind className="size-4" aria-hidden="true" /></span><div><p className="text-xs font-semibold text-[#385445]">PranaVeda</p><p className="text-[10px] text-[#82998b]">A little space for you</p></div></div>
          <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-[10px] font-semibold tracking-[.16em] text-[#477858] uppercase">{running ? "Practice in progress" : done ? "Practice complete" : "Relax"}</span>
        </div>

        <header className="mt-7 sm:mt-9">
          <p className="text-[10px] font-semibold tracking-[.24em] text-[#5c9a72] uppercase">Breathe gently</p>
          <h2 className="mt-1 text-3xl font-medium tracking-tight text-[#203b2c] sm:text-4xl">Serenity</h2>
          <p className="mt-2 text-sm text-[#72877b]">{done ? "Lovely work. Take this calm with you." : running ? "Stay with the rhythm. There is nowhere else to be." : "A softer moment starts with one breath."}</p>
        </header>

        <div className="relative mx-auto mt-5 flex aspect-square w-full max-w-[330px] items-center justify-center sm:mt-7 sm:max-w-[390px]" aria-live="polite" aria-label={`${phase.label}, ${phaseLeft} seconds`}>
          <div className="absolute inset-[3%] rounded-full bg-[radial-gradient(circle,#d5ead8_0%,#c9e4d0_40%,rgba(190,222,196,.12)_72%)] opacity-70 blur-2xl" aria-hidden="true" />
          <div className="relative flex aspect-square w-[82%] items-center justify-center rounded-full bg-[radial-gradient(circle_at_34%_25%,rgba(255,255,255,.98)_0%,rgba(255,255,255,.66)_19%,rgba(215,236,216,.85)_48%,rgba(186,220,194,.88)_76%,rgba(240,248,239,.98)_100%)] shadow-[inset_-18px_-22px_46px_rgba(75,132,91,.16),inset_14px_12px_34px_rgba(255,255,255,.9),0_22px_55px_-28px_rgba(65,125,82,.35)] transition-transform duration-[2800ms] ease-in-out motion-reduce:transition-none" style={{ transform: `scale(${orbScale})` }}>
            <div className="absolute inset-[9%] rounded-full border border-white/45" aria-hidden="true" />
            <div className="absolute inset-[20%] rounded-full bg-[radial-gradient(circle_at_36%_28%,rgba(255,255,255,.5),rgba(227,241,226,.12)_70%)]" aria-hidden="true" />
            <div className="relative px-5">
              <p className="text-[10px] font-semibold tracking-[.2em] text-[#477858] uppercase">{phase.label}</p>
              <p className="mt-1 font-display text-xl text-[#385445] sm:text-2xl">{phase.label === "Inhale" ? "Inhale…" : phase.label === "Exhale" ? "Exhale…" : "Be still…"}</p>
              <p className="mt-2 text-sm font-medium tabular-nums text-[#72877b]">{phaseLeft}</p>
            </div>
          </div>
        </div>

        <p className="-mt-1 text-xs text-[#72877b]">{PATTERNS[pattern].hint}</p>
        <div className="mx-auto mt-5 h-1 w-full max-w-[250px] overflow-hidden rounded-full bg-[#e2ebe1]" aria-label="Session progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}><div className="h-full rounded-full bg-gradient-to-r from-[#83bc91] to-[#4c9b70] transition-[width] duration-500" style={{ width: `${progress * 100}%` }} /></div>
        <p className="mt-2 text-[11px] tabular-nums text-[#82998b]">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} / {minutes}:00{done ? " · Complete" : ""}</p>

        <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-3">
          {!running ? <button type="button" onClick={() => { setDone(false); setRunning(true); }} className="inline-flex min-h-11 min-w-32 items-center justify-center gap-2 rounded-full bg-[#287652] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(29,111,84,.55)] transition hover:bg-[#1f6344] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#74ae86] focus-visible:ring-offset-2">{done ? <Check className="size-4" aria-hidden="true" /> : <Play className="size-4 fill-current" aria-hidden="true" />}{done ? "Again" : elapsed ? "Resume" : "Begin"}</button> : <button type="button" onClick={() => setRunning(false)} className="inline-flex min-h-11 min-w-32 items-center justify-center gap-2 rounded-full bg-[#287652] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(29,111,84,.55)] transition hover:bg-[#1f6344]"><Pause className="size-4" aria-hidden="true" />Pause</button>}
          {(elapsed > 0 || done) && <button type="button" onClick={stop} aria-label="Reset breathing practice" className="inline-flex size-11 items-center justify-center rounded-full border border-[#dce8d8] bg-white/75 text-[#72877b] transition hover:bg-white hover:text-[#385445]"><RotateCcw className="size-4" aria-hidden="true" /> </button>}
        </div>
        <p className="mt-4 text-[11px] text-[#82998b]">You can pause or stop whenever you like.</p>
      </section>

      <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-stretch">
        <section aria-label="Breathing pattern" className="min-w-0 rounded-3xl border border-[#dce8d8] bg-white/85 p-4 shadow-[0_12px_34px_-30px_rgba(48,103,72,.24)] sm:p-5">
          <div className="flex items-baseline justify-between gap-3"><h3 className="font-display text-base font-medium text-[#385445]">Choose a rhythm</h3><span className="text-[10px] text-[#82998b]">Follow your comfort</span></div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Breathing pattern">
            {(Object.keys(PATTERNS) as PatternKey[]).map((key) => <button key={key} type="button" role="radio" aria-checked={pattern === key} onClick={() => setPattern(key)} className={cn("min-w-0 rounded-2xl border px-3 py-2.5 text-left transition-colors", pattern === key ? "border-[#b9d6bf] bg-[#edf6ed] text-[#38674b]" : "border-[#e3ebe1] bg-white text-[#52675a] hover:border-[#c8ddc9] hover:bg-[#f7fbf6]")}><span className="block truncate text-xs font-semibold">{PATTERNS[key].label}</span><span className="mt-0.5 block truncate text-[10px] text-[#82998b]">{PATTERNS[key].hint}</span></button>)}
          </div>
        </section>

        <section aria-label="Session duration" className="rounded-3xl border border-[#dce8d8] bg-white/85 p-4 shadow-[0_12px_34px_-30px_rgba(48,103,72,.24)] sm:min-w-40 sm:p-5">
          <h3 className="font-display text-base font-medium text-[#385445]">Time</h3>
          <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-2 sm:gap-2">{DURATIONS.map((duration) => <button key={duration} type="button" aria-pressed={minutes === duration} onClick={() => setMinutes(duration)} className={cn("min-h-9 rounded-full px-2 text-xs font-semibold transition-colors", minutes === duration ? "bg-[#287652] text-white" : "bg-[#f0f5ef] text-[#52675a] hover:bg-[#e4efe3]")}>{duration} min</button>)}</div>
        </section>
      </div>
    </div>
  );
}
