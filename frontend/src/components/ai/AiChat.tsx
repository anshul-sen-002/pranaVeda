"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";

import { Bubble } from "@/components/ai/AiBubble";
import { AiChatHeader } from "@/components/ai/AiChatHeader";
import { AiRailBanner, AiRailQuote } from "@/components/ai/AiRailInner";
import { QuickSuggestions, SUGGESTIONS } from "@/components/ai/QuickSuggestions";
import { VoiceInputButton } from "@/components/ai/VoiceInputButton";
import { WhatsAppTypingDots } from "@/components/ai/WhatsAppTypingDots";
import { LotusMark } from "@/components/brand/LotusMark";
import { useAuth } from "@/hooks/useAuth";
import { aiApi, AI_MAX_MESSAGE_CHARS, AI_LANGUAGES, type AiMessage } from "@/lib/api/ai";
import { cn } from "@/lib/cn";

/**
 * AI wellness companion chat with streaming responses, WhatsApp-style typing
 * dots, voice input, and per-conversation language selection.
 */
export function AiChat() {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cid, setCid] = useState<number | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamingIdRef = useRef<number | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const appendStreamingBubble = useCallback(() => {
    const tempId = -Date.now();
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "ASSISTANT", content: "", createdAt: new Date().toISOString() },
    ]);
    streamingIdRef.current = tempId;
    return tempId;
  }, []);

  const updateStreamingBubble = useCallback((chunk: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === streamingIdRef.current ? { ...m, content: m.content + chunk } : m,
      ),
    );
  }, []);

  const finalizeStreaming = useCallback(() => {
    streamingIdRef.current = null;
    setStreaming(false);
  }, []);

  const send = async (text: string) => {
    const message = text.trim();
    if (!accessToken || !message || streaming) return;
    setStreaming(true);
    setError(null);
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: -prev.length - 1, role: "USER", content: message, createdAt: new Date().toISOString() },
    ]);

    const tempId = appendStreamingBubble();

    try {
      await aiApi.streamChat(accessToken, message, cid, language, (chunk) => {
        updateStreamingBubble(chunk);
      });

      // Fetch the persisted conversation to get the real IDs and full history.
      const res = await aiApi.chat(accessToken, message, cid, language);
      setCid(res.conversationId ?? null);
      setMessages(res.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The assistant is unavailable right now.");
      // Remove the incomplete streaming bubble on error.
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      finalizeStreaming();
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setInput((prev) => (prev ? prev + " " : "") + transcript);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21rem]">
      <section aria-label="AI wellness companion chat" className="flex min-h-[calc(100dvh-12rem)] flex-col overflow-hidden rounded-3xl border border-border-soft bg-surface sm:min-h-[calc(100dvh-13rem)]">
        <AiChatHeader />

        {/* Language selector bar */}
        <div className="px-4 py-2 sm:px-5 border-b border-border-soft/50 bg-surface/50 backdrop-blur-sm">
          <span className="text-[11px] font-medium text-muted uppercase tracking-wider">Reply language</span>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(null)}
              aria-label="Auto-detect language"
              aria-pressed={!language}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!language ? "bg-primary-100 text-primary-700" : "text-muted hover:bg-primary-50"}`}
            >
              Auto
            </button>
            {AI_LANGUAGES.map((lng) => (
              <button
                key={lng.code}
                type="button"
                onClick={() => setLanguage(lng.code)}
                aria-label={`Reply in ${lng.label}`}
                aria-pressed={language === lng.code}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  language === lng.code
                    ? "bg-primary-100 text-primary-700"
                    : "text-muted hover:bg-primary-50",
                )}
              >
                {lng.label}
              </button>
            ))}
          </div>
        </div>

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
            messages.map((m) => <Bubble key={m.id} role={m.role} content={m.content} createdAt={m.createdAt} streaming={m.id === streamingIdRef.current} />)
          )}
          {streaming ? (
            <div className="flex items-center gap-2.5">
              <span className="rounded-2xl rounded-bl-md bg-primary-50 px-4 py-2.5 text-sm text-muted">
                <WhatsAppTypingDots text="Thinking" />
              </span>
            </div>
          ) : null}
          {error ? <p className="rounded-xl bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">{error}</p> : null}
        </div>
        <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-border-soft/50 bg-surface/50 backdrop-blur-sm">
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
              placeholder="Type your message…"
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-heading placeholder:text-muted focus:outline-none"
            />
            <VoiceInputButton
              language={language ?? "en"}
              onResult={handleVoiceResult}
              disabled={streaming || !accessToken}
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
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
