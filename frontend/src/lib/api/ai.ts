import { apiRequest } from "./client";

/* ------------------------------------------------------------------ */
/* AI wellness companion (mirrors backend AiChatResponse)             */
/* ------------------------------------------------------------------ */

export type AiRole = "USER" | "ASSISTANT";

export interface AiMessage {
  id: number;
  role: AiRole;
  content: string;
  createdAt: string;
}

export interface AiChatResponse {
  conversationId: number | null;
  reply: string;
  model: string | null;
  createdAt: string | null;
  messages: AiMessage[];
}

export interface AiConversationSummary {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

/** Longest prompt we send (mirrors the backend @Size(max = 4000)). */
export const AI_MAX_MESSAGE_CHARS = 4000;

/** Supported reply languages for the AI companion. */
export interface AiLanguage {
  code: string;
  label: string;
}

export const AI_LANGUAGES: AiLanguage[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "hi", label: "हिन्दी" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
];

/**
 * AI chat (agents.md 2.14). Member-only; the server holds the provider key,
 * applies rate limits/timeouts, and returns a safe fallback reply on failure.
 * No history is stored beyond the current conversation unless the backend is
 * configured to persist it.
 */
export const aiApi = {
  chat(
    accessToken: string,
    message: string,
    conversationId?: number | null,
    language?: string | null,
  ): Promise<AiChatResponse> {
    return apiRequest<AiChatResponse>("/api/v1/ai/chat", {
      method: "POST",
      accessToken,
      body: { message, conversationId: conversationId ?? null, language: language ?? null },
    });
  },

  /**
   * Streams the assistant reply as Server-Sent Events. Calls `onChunk` for
   * every text delta received. Resolves with the full chat response once
   * the stream completes (including the [DONE] marker).
   */
  async streamChat(
    accessToken: string,
    message: string,
    conversationId?: number | null,
    language?: string | null,
    onChunk?: (chunk: string) => void,
  ): Promise<AiChatResponse> {
    const controller = new AbortController();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/api/v1/ai/chat/stream`, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      signal: controller.signal,
      body: JSON.stringify({ message, conversationId: conversationId ?? null, language: language ?? null }),
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      throw new Error(`Stream failed: ${res.status} ${text}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullReply = "";
    let conversationIdResult: number | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const choices = json.choices;
            if (Array.isArray(choices) && choices.length > 0) {
              const delta = choices[0].delta;
              if (delta && typeof delta.content === "string" && delta.content) {
                fullReply += delta.content;
                onChunk?.(delta.content);
              }
            }
          } catch {
            // Skip malformed SSE data lines.
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Return a minimal response; the caller merges chunks into local state.
    return {
      conversationId: conversationIdResult,
      reply: fullReply,
      model: null,
      createdAt: null,
      messages: [],
    };
  },
};
