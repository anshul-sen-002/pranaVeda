"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";

import { Bubble } from "@/components/ai/AiBubble";
import { AiChatHeader } from "@/components/ai/AiChatHeader";
import { AiRailBanner, AiRailQuote } from "@/components/ai/AiRailInner";
import { QuickSuggestions, SUGGESTIONS } from "@/components/ai/QuickSuggestions";
import { LotusMark } from "@/components/brand/LotusMark";
import { useAuth } from "@/hooks/useAuth";
import { aiApi, AI_MAX_MESSAGE_CHARS, type AiMessage } from "@/lib/api/ai";
import { ApiError } from "@/lib/api/client";
import { DotLoader } from "@/components/motion/DotLoader";

/** Screenshot layout, live backend: chat card + quick-suggestion rail. */
export function AiChat() {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cid, setCid] = useState<number | null>(null);
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
      const res = await aiApi.chat(accessToken, message, cid);
      setCid(res.conversationId);
      if (res.messages.length > 0) setMessages(res.messages);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The assistant is unavailable right now.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21rem]">
      <section aria-label="AI wellness companion chat" className="flex min-h-[calc(100dvh-12rem)] flex-col overflow-hidden rounded-3xl border border-border-soft bg-surface sm:min-h-[calc(100dvh-13rem)]">
        <AiChatHeader />
        <div ref={scrollRef} aria-live="polite" className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-64 flex-col items-center justify-center gap-4 text-center">
              <LotusMark className="size-12 text-primary-300" />
              <p className="max-w-sm text-sm text-muted">Ask about poses, calming audio, or a gentle routine.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.slice(0, 3).map((s) => (
                  <button key={s.label} type="button" onClick={() => void send(s.label)} className="rounded-full border border-border-soft bg-surface px-3.5 py-2 text-xs font-medium text-body transition-colors hover:border-primary-300 hover:text-primary-700">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => <Bubble key={m.id} role={m.role} content={m.content} createdAt={m.createdAt} />)
          )}
          {sending ? (
            <div className="flex items-center gap-2.5">
              <span className="rounded-2xl rounded-bl-md bg-primary-50 px-4 py-2.5 text-sm text-muted">
                <DotLoader text="Thinking…" inline size="sm" />
              </span>
            </div>
          ) : null}
          {error ? <p className="rounded-xl bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">{error}</p> : null}
        </div>
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <form
            onSubmit={(e) => { e.preventDefault(); void send(input); }}
            className="flex items-center gap-2 rounded-2xl border border-border-soft bg-surface-tint/60 p-1.5 pl-2 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-200"
          >
            <label htmlFor="ai-message" className="sr-only">Type your message</label>
            <textarea
              id="ai-message"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, AI_MAX_MESSAGE_CHARS))}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
              rows={1}
              placeholder="Type your message..."
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-heading placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition-all hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-50"
            >
              <SendHorizonal className="size-4.5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>
      <aside className="grid content-start gap-4">
        <AiRailBanner />
        <QuickSuggestions onPick={(label) => void send(label)} />
        <AiRailQuote />
      </aside>
    </div>
  );
}
