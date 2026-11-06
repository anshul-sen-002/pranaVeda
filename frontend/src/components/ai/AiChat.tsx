"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, SendHorizonal, ShieldCheck, Sparkles, SquarePen } from "lucide-react";

import { Bubble } from "@/components/ai/AiBubble";
import { AiChatHeader } from "@/components/ai/AiChatHeader";
import { AiRailBanner, AiRailQuote } from "@/components/ai/AiRailInner";
import { QuickSuggestions, SUGGESTIONS } from "@/components/ai/QuickSuggestions";
import { VoiceInputButton } from "@/components/ai/VoiceInputButton";
import { WhatsAppTypingDots } from "@/components/ai/WhatsAppTypingDots";
import { LotusMark } from "@/components/brand/LotusMark";
import { useAuth } from "@/hooks/useAuth";
import { aiApi, AI_MAX_MESSAGE_CHARS, cleanSavedAssistantMessage, type AiMessage } from "@/lib/api/ai";
import { aiHistoryApi } from "@/lib/api/extras";

/**
 * AI wellness companion chat with streaming responses, WhatsApp-style typing
 * dots, voice input, and per-conversation language selection.
 */
export function AiChat() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedConversationId = searchParams.get("conversationId");
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [streamingId, setStreamingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cid, setCid] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingIdRef = useRef<number | null>(null);
  const messageIdCounterRef = useRef(0);
  const loadedConversationIdRef = useRef<string | null>(null);
  const activeConversationRef = useRef<string | null>(requestedConversationId);

  useEffect(() => {
    activeConversationRef.current = requestedConversationId;
    if (!requestedConversationId) {
      if (loadedConversationIdRef.current !== null) {
        loadedConversationIdRef.current = null;
        setCid(null);
        setMessages([]);
        setError(null);
        setLoadingConversation(false);
      }
      return;
    }
    if (!accessToken) return;
    if (loadedConversationIdRef.current === requestedConversationId) return;
    const id = Number(requestedConversationId);
    if (!Number.isSafeInteger(id) || id <= 0) return;
    let active = true;
    void Promise.resolve().then(async () => {
      if (!active) return;
      setLoadingConversation(true);
      setMessages([]);
      setCid(null);
      try {
        const conversation = await aiHistoryApi.get(accessToken, id);
        if (!active) return;
        loadedConversationIdRef.current = requestedConversationId;
        setError(null);
        setCid(conversation.conversationId ?? id);
        setMessages((conversation.messages ?? []).map(cleanSavedAssistantMessage));
      } catch {
        if (active) setError("Could not load this saved conversation.");
      } finally {
        if (active) setLoadingConversation(false);
      }
    });
    return () => { active = false; };
  }, [accessToken, requestedConversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const updateStreamingBubble = useCallback((chunk: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === streamingIdRef.current ? { ...m, content: m.content + chunk } : m,
      ),
    );
  }, []);

  const finalizeStreaming = useCallback(() => {
    streamingIdRef.current = null;
    setStreamingId(null);
    setStreaming(false);
  }, []);

  const send = async (text: string) => {
    const message = text.trim();
    if (!accessToken || !message || streaming || loadingConversation) return;
    const userId = -(++messageIdCounterRef.current);
    const threadAtStart = activeConversationRef.current;
    setStreaming(true);
    setHasContent(false);
    setError(null);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "USER", content: message, createdAt: new Date().toISOString() },
    ]);

    const tempId = -(++messageIdCounterRef.current);
    streamingIdRef.current = tempId;
    setStreamingId(tempId);
    let firstChunk = true;

    try {
      const { conversationId } = await aiApi.streamChat(accessToken, message, cid, null, (chunk) => {
        if (firstChunk) {
          firstChunk = false;
          setHasContent(true);
          setMessages((prev) => [
            ...prev,
            { id: tempId, role: "ASSISTANT", content: chunk, createdAt: new Date().toISOString() },
          ]);
        } else {
          updateStreamingBubble(chunk);
        }
      });
      if (activeConversationRef.current === threadAtStart) setCid(conversationId ?? null);
      if (conversationId != null && activeConversationRef.current === threadAtStart) {
        try {
          // Replace temporary stream ids/timestamps with the canonical saved
          // thread so the visible reply and conversation history stay aligned.
          const saved = await aiHistoryApi.get(accessToken, conversationId);
          if (activeConversationRef.current === threadAtStart) {
            setMessages((saved.messages ?? []).map(cleanSavedAssistantMessage));
          }
        } catch {
          // Keep the streamed reply visible if the follow-up history read fails.
        }
      }
    } catch (err) {
      // Set error message and immediately clear streaming state so the error
      // takes exclusive precedence over the typing indicator.
      setError(err instanceof Error ? err.message : "The assistant is unavailable right now.");
      if (activeConversationRef.current === threadAtStart) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId && m.id !== userId));
        setInput(message);
      }
      setStreaming(false);
      setStreamingId(null);
      setHasContent(false);
    } finally {
      // Still ensure cleanup even if catch logic misses something.
      finalizeStreaming();
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setInput((prev) => (prev ? prev + " " : "") + transcript);
  };

  const startNewChat = () => {
    if (streaming) return;
    activeConversationRef.current = null;
    loadedConversationIdRef.current = null;
    setMessages([]);
    setCid(null);
    setError(null);
    setInput("");
    if (requestedConversationId) router.replace("/ai", { scroll: false });
  };

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1440px] min-w-0 flex-col items-stretch gap-4 sm:h-auto xl:grid xl:grid-cols-[minmax(0,1fr)_19rem] xl:items-start 2xl:grid-cols-[minmax(0,1fr)_21rem]">
      <section aria-label="AI wellness companion chat" className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-y border-[#e4eadd] bg-white shadow-[0_22px_70px_-48px_rgba(29,63,46,.38)] sm:h-[min(74dvh,800px)] sm:min-h-[520px] sm:flex-none sm:rounded-3xl sm:border xl:min-h-[600px]">
        <AiChatHeader onNewChat={startNewChat} newChatDisabled={streaming} />

        <div ref={scrollRef} aria-live="polite" aria-relevant="additions text" className="scrollbar-none min-h-0 flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(232,241,226,.42),transparent_55%),#fbfcf9] px-3 py-3.5 sm:space-y-6 sm:px-7 sm:py-7">
          {loadingConversation ? <p className="py-6 text-center text-sm text-muted">Loading conversation history…</p> : null}
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center py-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl border border-[#dfe9dc] bg-gradient-gourd-white text-primary-700 shadow-sm sm:size-[4.5rem]">
                <LotusMark className="size-8 sm:size-10" />
              </span>
              <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold tracking-wide text-primary-700 shadow-sm sm:mt-5 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[11px]">
                <Sparkles className="size-3.5" aria-hidden="true" /> YOUR WELLNESS COMPANION
              </p>
              <h1 className="mt-2 max-w-lg text-balance text-xl font-semibold tracking-tight text-heading sm:mt-3 sm:text-3xl">What would you like support with?</h1>
              <p className="mt-1.5 max-w-md text-xs leading-relaxed text-body sm:mt-2 sm:text-base">Explore yoga, breathing, meditation, and gentle everyday wellness habits.</p>
              <div className="mt-4 grid w-full max-w-2xl gap-1.5 sm:mt-6 sm:grid-cols-2 sm:gap-2">
                {SUGGESTIONS.slice(0, 4).map((s) => (
                  <button key={s.label} type="button" onClick={() => void send(s.label)} disabled={streaming} className="group flex min-h-10 items-center gap-2 rounded-xl border border-[#e6eadd] bg-white/90 px-2.5 py-2 text-left text-[11px] font-medium leading-snug text-body shadow-[0_8px_22px_-20px_rgba(29,63,46,.4)] transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md disabled:opacity-60 sm:min-h-12 sm:gap-3 sm:rounded-2xl sm:px-3.5 sm:py-3 sm:text-sm">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 sm:size-8 sm:rounded-xl"><s.icon className="size-3.5 sm:size-4" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">{s.label}</span>
                    <SquarePen className="size-4 shrink-0 text-primary-400 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => <Bubble key={m.id} role={m.role} content={m.content} createdAt={m.createdAt} streaming={m.id === streamingId} />)
          )}
          {streaming && !hasContent && !error ? (
            <div className="flex gap-2 sm:gap-2.5">
              <span
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 sm:size-8"
                aria-hidden="true"
              >
                <Bot className="size-4" />
              </span>
              <span className="rounded-2xl rounded-bl-md bg-primary-50/70 px-3 py-2.5 text-body sm:px-4 sm:py-3">
                <WhatsAppTypingDots />
              </span>
            </div>
          ) : null}
          {error ? <p className="rounded-xl bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">{error}</p> : null}
        </div>
        <div className="border-t border-[#e9ede5] bg-white/95 px-2.5 pt-2 pb-2.5 backdrop-blur-sm sm:px-5 sm:pt-4 sm:pb-4">
          <form
            onSubmit={(e) => { e.preventDefault(); void send(input); }}
            className="mx-auto flex max-w-4xl items-end gap-1.5 rounded-[1.15rem] border border-[#dfe6db] bg-[#f8faf6] p-1 pl-2.5 shadow-[0_10px_28px_-24px_rgba(29,63,46,.45)] transition-[border-color,box-shadow] focus-within:border-primary-300 focus-within:shadow-[0_0_0_2px_rgba(143,193,173,.16)] sm:gap-2.5 sm:rounded-[1.4rem] sm:p-2 sm:pl-4"
          >
            <label htmlFor="ai-message" className="sr-only">Type your message</label>
            <textarea
              ref={inputRef}
              id="ai-message"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, AI_MAX_MESSAGE_CHARS))}
              onInput={(e) => { e.currentTarget.style.height = "auto"; e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 128)}px`; }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
              rows={1}
              placeholder="Type your message…"
              className="max-h-24 min-h-9 min-w-0 flex-1 resize-none bg-transparent px-1 py-2 text-[13px] leading-5 text-heading placeholder:text-muted focus:outline-none sm:max-h-32 sm:min-h-10 sm:px-2 sm:py-2.5 sm:text-[15px]"
            />
            <VoiceInputButton
              language="en"
              onResult={handleVoiceResult}
              disabled={streaming || !accessToken}
              className="mb-0.5"
            />
            <button
              type="submit"
              disabled={streaming || loadingConversation || !input.trim()}
              aria-label="Send message"
              className="mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-white shadow-[0_7px_18px_-8px_rgba(29,111,84,.75)] transition-all hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-45 sm:size-11"
            >
              <SendHorizonal className="size-4.5" aria-hidden="true" />
            </button>
          </form>
          <p className="mx-auto mt-1.5 max-w-4xl px-1 text-center text-[9px] leading-tight text-muted sm:mt-2 sm:text-[11px] sm:leading-relaxed">
            <ShieldCheck className="mr-1 inline size-3.5 align-[-2px] text-primary-600" aria-hidden="true" />Educational wellness support only. Not medical advice.
          </p>
        </div>
      </section>
      <aside className="hidden content-start gap-4 xl:grid">
        <AiRailBanner />
        <QuickSuggestions onPick={(label) => void send(label)} />
        <AiRailQuote />
      </aside>
    </div>
  );
}
