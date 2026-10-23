"use client";

import { Mic, MicOff, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionEventTarget {
  resultIndex: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[];
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

/**
 * Voice input button using the Web Speech API.
 * - Click to start/stop speech recognition.
 * - Supports multiple languages via BCP-47 codes.
 * - Shows animated visual feedback while listening.
 * - Calls `onResult` with the transcribed transcript when final.
 */
export function VoiceInputButton({
  language = "en",
  onResult,
  className,
  disabled = false,
}: {
  language?: string;
  onResult?: (transcript: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const SpeechRecognition =
    (typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)) ||
    null;

  // Map our language codes to BCP-47 for the Speech API.
  const bcp47Map: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    hi: "hi-IN",
    ja: "ja-JP",
    ko: "ko-KR",
  };
  const lang = bcp47Map[language] || "en-US";

  useEffect(() => {
    setSupported(SpeechRecognition != null);

    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang;

    rec.onstart = () => setListening(true);
    rec.onend = () => {
      setListening(false);
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      if (transcript.trim() && onResult) {
        onResult(transcript);
      }
    };
    rec.onerror = () => {
      setListening(false);
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };

    recognitionRef.current = rec;
    return () => {
      try { rec.abort(); } catch { /* ignore */ }
    };
  }, [language, onResult, SpeechRecognition]);

  const start = () => {
    if (!supported || listening || disabled || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      // Animated mic pulse while listening
      animationRef.current = setInterval(() => {}, 1000);
    } catch {
      setListening(false);
    }
  };

  const stop = () => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch { /* ignore */ }
    setListening(false);
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  if (supported === false) {
    return (
      <button
        type="button"
        disabled
        aria-label="Voice input not supported"
        title="Voice input not supported in this browser"
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-tint/60 text-muted disabled:opacity-40",
          className,
        )}
      >
        <MicOff className="size-4.5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => (listening ? stop() : start())}
      onMouseDown={() => setListening((l) => (l ? l : true))} // immediate visual on press
      onMouseUp={stop}
      onMouseLeave={stop}
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      aria-pressed={listening}
      title={listening ? "Listening…" : "Voice input"}
      disabled={disabled}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-200",
        listening
          ? "bg-primary-600 text-white animate-pulse"
          : "bg-surface-tint/60 text-primary-600 hover:bg-primary-50",
        disabled && "opacity-40 pointer-events-none",
        className,
      )}
    >
      {listening ? (
        <MicOff className="size-4.5" aria-hidden="true" />
      ) : (
        <Mic className="size-4.5" aria-hidden="true" />
      )}
    </button>
  );
}