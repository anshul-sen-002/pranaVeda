"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, User } from "lucide-react";

import { MemberGuard } from "@/components/auth/MemberGuard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { LotusMark } from "@/components/brand/LotusMark";
import { useAuth } from "@/hooks/useAuth";
import { aiApi, AI_MAX_MESSAGE_CHARS, type AiMessage } from "@/lib/api/ai";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/cn";

const SUGGESTIONS = [
  "Suggest a gentle 10-minute morning routine.",
  "How do I modify Tree Pose if my balance is shaky?",
  "Which calm track helps with focus?",
];

export default function AiAssistantPage() {
  return (
    <MemberGuard>
      <DashboardShell>
        <AiChat />
      </DashboardShell>
    </MemberGuard>
  );
}

function AiChat() {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!accessToken || !message || sending) return;
    setSending(true);
    setError(null);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: -prev.length - 1, role: "USER", content: message, createdAt: new Date().toISOString() },
    ]);
    try {
      const res = await aiApi.chat(accessToken, message, conversationId);
      setConversationId(res.conversationId);
      if (res.messages.length > 0) setMessages(res.messages);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The assistant is unavailable right now.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-9rem)] max-w-3xl flex-col">
      <header className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading sm:text-2xl">AI Wellness Companion</h1>
          <p className="mt-0.5 text-sm leading-relaxed text-body">
            Educational yoga and wellness guidance. Not a doctor — for urgent symptoms, seek qualified care.
          </p>
        </div>
      </header>

      <div ref={scrollRef} className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-3xl border border-border-soft bg-surface p-4" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <LotusMark className="size-12 text-primary-300" />
            <p className="max-w-sm text-sm text-muted">Ask about poses, modifications, calming audio, or building a gentle routine.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => void send(s)} className="rounded-full border border-border-soft bg-surface px-3.5 py-2 text-xs font-medium text-body transition-colors hover:border-primary-300 hover:text-primary-700">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => <Bubble key={m.id} role={m.role} content={m.content} />)
        )}
        {sending ? (
          <div className="flex items-center gap-2 px-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Thinking…
          </div>
        ) : null}
        {error ? <p className="rounded-xl bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">{error}</p> : null}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void send(input); }} className="mt-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, AI_MAX_MESSAGE_CHARS))}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
          rows={1}
          placeholder="Ask about yoga, breathing, or a calm routine…"
          aria-label="Message the AI companion"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-border-soft bg-surface px-4 py-3 text-sm text-heading placeholder:text-muted focus:border-primary-300 focus:ring-2 focus:ring-primary-200 focus:outline-none"
        />
        <button type="submit" disabled={sending || !input.trim()} aria-label="Send message" className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-50">
          <Send className="size-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

function Bubble({ role, content }: { role: AiMessage["role"]; content: string }) {
  const isUser = role === "USER";
  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", isUser ? "bg-primary-100 text-primary-700" : "bg-surface-tint text-primary-600")} aria-hidden="true">
        {isUser ? <User className="size-4" /> : <Sparkles className="size-4" />}
      </span>
      <div className={cn("max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed", isUser ? "bg-primary-600 text-white" : "bg-surface-tint text-body")}>
        {content}
      </div>
    </div>
  );
}
