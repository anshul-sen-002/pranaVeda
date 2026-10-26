"use client";

import { Mic, MicOff, AlertCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[];
  error?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

/**
 * Human-readable explanations for Web Speech API error codes so a failure
 * never silently leaves the user wondering why the mic "isn't working".
 */
const RECOGNITION_ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Microphone access was blocked. Allow microphone access, then try again, or type your message instead.",
  "no-speech": "No speech was detected. Speak clearly and try again.",
  "audio-capture": "No microphone found on this device.",
  "not-supported": "Speech recognition isn't supported on this browser.",
  "service-not-allowed": "The speech service is unavailable right now. Type your message instead.",
  "network": "Network error while transcribing. Try again.",
};

/**
 * Voice input button using the Web Speech API.
 * - Click to start/stop speech recognition.
 * - Shows live interim transcript while speaking.
 * - Calls `onResult` with the final transcript.
 * - Surfaces microphone/permission errors instead of failing silently.
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
  const [error, setError] = useState<string | null>(null);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
    setError(null);

    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true; // live feedback while speaking
    rec.lang = lang;

    rec.onstart = () => {
      setListening(true);
      setError(null);
      setInterim("");
    };
    rec.onend = () => {
      setListening(false);
    };
    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (const result of event.results) {
        const transcript = result[0].transcript;
        if (result.isFinal) finalTranscript += transcript;
        else interimTranscript += transcript;
      }
      setInterim(interimTranscript);
      if (finalTranscript.trim() && onResult) {
        onResult(finalTranscript.trim());
        setInterim("");
      }
    };
    rec.onerror = (event: SpeechRecognitionEvent) => {
      setListening(false);
      setInterim("");
      const code = (event.error || "unknown").toString();
      setError(
        RECOGNITION_ERROR_MESSAGES[code] ||
          "Couldn't transcribe that. Try typing instead.",
      );
    };

    recognitionRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
    };
  }, [language, onResult, SpeechRecognition]);

  const start = useCallback(() => {
    if (!supported || listening || disabled || !recognitionRef.current) return;
    setError(null);
    try {
      recognitionRef.current.start();
    } catch {
      setListening(false);
      setError("Couldn't start the microphone. Try again.");
    }
  }, [supported, listening, disabled]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
    setInterim("");
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const isSupported = supported === true;
  const isUnsupported = supported === false;

  return (
    <div className="relative inline-flex size-10 shrink-0" style={{ display: "inline-flex" }}>
      <button
        type="button"
        onClick={() => (listening ? stop() : start())}
        onMouseDown={clearError}
        aria-label={listening ? "Stop voice input" : "Start voice input"}
        aria-pressed={listening}
        title={
          listening
            ? "Listening…"
            : isUnsupported
              ? "Voice input not supported on this browser"
              : "Voice input"
        }
        disabled={disabled || !isSupported || listening}
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-200",
          listening
            ? "bg-primary-600 text-white animate-pulse"
            : !isSupported
              ? "bg-danger/10 text-danger border border-danger/20"
              : "bg-surface-tint/60 text-primary-600 hover:bg-primary-50",
          disabled && "opacity-40 pointer-events-none",
          className,
        )}
      >
        {listening ? (
          <MicOff className="size-4.5" aria-hidden="true" />
        ) : isUnsupported ? (
          <AlertCircle className="size-4.5" aria-hidden="true" />
        ) : (
          <Mic className="size-4.5" aria-hidden="true" />
        )}
      </button>

      {interim && listening && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 rounded-full bg-surface border border-border-soft px-2.5 py-1 text-[11px] text-muted shadow-sm whitespace-nowrap">
          {interim}
        </span>
      )}

      {error && (
        <p className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 rounded bg-danger/10 border border-danger/20 px-2.5 py-1.5 text-[11px] text-danger text-center shadow-sm whitespace-normal max-w-[220px] leading-tight" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}