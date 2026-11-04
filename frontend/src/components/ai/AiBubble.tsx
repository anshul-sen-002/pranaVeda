"use client";

import { Bot, Speaker, User, VolumeX } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import type { AiMessage } from "@/lib/api/ai";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

/** Local clock label for a message (backend `createdAt` is UTC ISO). */
export function clockLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Splits `content` into paragraphs; consecutive "1. …" lines become an <ol>. */
export function FormattedContent({ content }: { content: string }) {
  const blocks: { kind: "p" | "ol"; lines: string[] }[] = [];
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    if (numbered) {
      const last = blocks[blocks.length - 1];
      if (last?.kind === "ol") last.lines.push(numbered[1]);
      else blocks.push({ kind: "ol", lines: [numbered[1]] });
    } else {
      blocks.push({ kind: "p", lines: [line] });
    }
  }
  return (
    <div className="space-y-2">
      {blocks.map((b, i) =>
        b.kind === "ol" ? (
          <ol key={i} className="list-decimal space-y-0.5 pl-5">
            {b.lines.map((l, j) => (
              <li key={j}>{l}</li>
            ))}
          </ol>
        ) : (
          <p key={i}>{b.lines[0]}</p>
        ),
      )}
    </div>
  );
}

/** Speaker toggle for an AI assistant message: reads the bubble aloud via Web Speech API. */
export function SpeakerToggle({ content, supported }: { content: string; supported: boolean }) {
  const speech = useSpeechSynthesis();
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if (speech.speaking) {
      speech.cancel();
      setSpeaking(false);
    } else {
      speech.speak(content);
      setSpeaking(true);
    }
  };

  useEffect(() => {
    if (!speech.speaking) setSpeaking(false);
  }, [speech.speaking]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={speaking ? "Stop reading aloud" : "Read aloud"}
      aria-pressed={speaking}
      className="shrink-0 size-7 rounded-full border border-border-soft bg-surface p-1 text-muted transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-200"
    >
      {speaking ? (
        <VolumeX className="size-4" aria-hidden="true" />
      ) : (
        <Speaker className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}

/** One chat bubble, screenshot style: soft green cards + timestamp. */
export function Bubble({ role, content, createdAt, streaming = false }: { role: AiMessage["role"]; content: string; createdAt: string; streaming?: boolean }) {
  const isUser = role === "USER";
  const label = clockLabel(createdAt);
  const speech = useSpeechSynthesis();

  return (
    <div className={cn("flex items-end gap-1.5 sm:gap-3", isUser && "flex-row-reverse")}>
      <span
        className={cn("mb-5 flex size-7 shrink-0 items-center justify-center rounded-[10px] border text-primary-700 shadow-sm sm:size-8 sm:rounded-xl", isUser ? "border-primary-700 bg-primary-700 text-white" : "border-[#e3ebdf] bg-gradient-gourd-white")}
        aria-hidden="true"
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </span>
      <div className={cn("min-w-0 max-w-[91%] sm:max-w-[78%]", isUser && "flex flex-col items-end")}>
        <p className={cn("mb-0.5 px-1 text-[9px] font-semibold tracking-wide text-muted sm:mb-1 sm:text-[10px]", isUser && "text-right")}>{isUser ? "You" : "PranaVeda"}</p>
        <div
          className={cn(
            "break-words px-3 py-2.5 text-[13px] leading-[1.55] [overflow-wrap:anywhere] sm:px-5 sm:py-3.5 sm:text-[15px] sm:leading-relaxed",
            isUser
              ? "rounded-2xl rounded-br-md bg-gradient-primary text-white shadow-[0_10px_24px_-18px_rgba(20,84,63,.65)]"
              : "rounded-2xl rounded-bl-md border border-[#e7ece3] bg-white text-body shadow-[0_8px_24px_-22px_rgba(29,63,46,.5)]",
          )}
        >
          <FormattedContent content={content} />
        </div>
        {!isUser && !streaming && (
          <SpeakerToggle content={content} supported={speech.supported} />
        )}
        {label ? <p className="mt-1 px-1 text-[10px] text-muted tabular-nums sm:text-[11px]">{label}</p> : null}
      </div>
    </div>
  );
}
