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
  ): Promise<{ conversationId: number | null }> {
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
      // Extract user-friendly message from backend error, hiding internal details
      let userMessage = "The assistant is unavailable right now.";
      try {
        const errorBody = JSON.parse(text);
        // Handle token expired - show sign-in prompt style message
        if (errorBody?.code === "TOKEN_EXPIRED" || errorBody?.status === 401) {
          userMessage = "Your session has expired. Please sign in again.";
        } else if (errorBody?.message) {
          // Don't expose internal error details to the user
          userMessage = "The assistant is unavailable right now.";
        }
      } catch {
        // If we can't parse the error, use generic message
      }
      throw new Error(userMessage);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let conversationIdResult: number | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep incomplete line in buffer

        let currentEvent = "message";
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.slice(6).trim();
            continue;
          }
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          if (currentEvent === "conversation-id") {
            try {
              conversationIdResult = Number(payload);
              if (!Number.isFinite(conversationIdResult)) conversationIdResult = null;
            } catch {
              // Ignore unparseable conversation id.
            }
            continue;
          }
          // The backend emits plain-text SSE deltas (e.g. `data: Hello`).
          // Tolerate OpenAI-style JSON (`data: {"choices":[...]}`) too so the
          // parser works with either shape. Non-JSON payloads are treated as
          // plain text chunks and streamed to the UI.
          let parsed: unknown = null;
          try {
            parsed = JSON.parse(payload);
          } catch {
            // Not JSON - treat as a plain-text content delta below.
          }
          let contentFromJson: string | null = null;
          if (parsed !== null && typeof parsed === "object") {
            const choices = (parsed as { choices?: unknown }).choices;
            if (Array.isArray(choices) && choices.length > 0) {
              const first = choices[0];
              const delta =
                first && typeof first === "object"
                  ? (first as { delta?: unknown }).delta
                  : undefined;
              if (delta && typeof delta === "object") {
                const c = (delta as { content?: unknown }).content;
                if (typeof c === "string" && c) contentFromJson = c;
              }
            }
          }
          if (contentFromJson) {
            onChunk?.(contentFromJson);
          } else if (parsed === null) {
            // Plain-text chunk from our backend.
            if (payload) onChunk?.(payload);
          }
          // Valid JSON that doesn't match the expected shape is skipped.
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { conversationId: conversationIdResult };
  },
};
