"use client";

import { Bot, User } from "lucide-react";

import type { AiMessage } from "@/lib/api/ai";
import { cn } from "@/lib/cn";

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

/** One chat bubble, screenshot style: soft green cards + timestamp. */
export function Bubble({ role, content, createdAt, streaming = false }: { role: AiMessage["role"]; content: string; createdAt: string; streaming?: boolean }) {
  const isUser = role === "USER";
  const label = clockLabel(createdAt);
  return (
    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
      <span
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700"
        aria-hidden="true"
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </span>
      <div className={cn("max-w-[85%] sm:max-w-[78%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "px-4 py-3 text-sm leading-relaxed transition-colors",
            isUser
              ? "rounded-2xl rounded-br-md bg-primary-100/80 text-heading"
              : `rounded-2xl rounded-bl-md bg-primary-50/70 text-body ${streaming ? "animate-pulse" : ""}`,
          )}
        >
          <FormattedContent content={content} />
          {streaming && <span className="inline-block animate-ping opacity-75" aria-hidden="true">…</span>}
        </div>
        {label ? <p className="mt-1 px-1 text-[11px] text-muted tabular-nums">{label}</p> : null}
      </div>
    </div>
  );
}
