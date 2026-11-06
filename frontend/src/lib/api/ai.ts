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

/** Parse one or more concatenated provider chunks and return only reply text. */
export function extractProviderReplyText(raw: string): string | null {
  const objects: Record<string, unknown>[] = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    if (start < 0) {
      if (char === "{") { start = i; depth = 1; }
      continue;
    }
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          const value: unknown = JSON.parse(raw.slice(start, i + 1));
          if (value && typeof value === "object" && !Array.isArray(value)) {
            objects.push(value as Record<string, unknown>);
          }
        } catch { /* Ignore incomplete/non-JSON segments. */ }
        start = -1;
      }
    }
  }
  if (objects.length === 0) return null;

  let isProviderPayload = false;
  let reply = "";
  for (const object of objects) {
    const choices = object.choices;
    if (!Array.isArray(choices)) continue;
    isProviderPayload = true;
    for (const choice of choices) {
      if (!choice || typeof choice !== "object") continue;
      const item = choice as Record<string, unknown>;
      const delta = item.delta && typeof item.delta === "object"
        ? item.delta as Record<string, unknown>
        : null;
      const message = item.message && typeof item.message === "object"
        ? item.message as Record<string, unknown>
        : null;
      const content = delta?.content ?? message?.content;
      if (typeof content === "string") reply += content;
    }
  }
  return isProviderPayload ? reply : null;
}

/** Legacy streamed conversations may contain raw provider JSON; hide metadata/reasoning. */
export function cleanSavedAssistantMessage(message: AiMessage): AiMessage {
  if (message.role !== "ASSISTANT") return message;
  const text = extractProviderReplyText(message.content);
  if (text === null) return message;
  return { ...message, content: text || "This earlier reply has no readable answer." };
}

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
 * Signed-in conversations are persisted by the backend and scoped to their owner.
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
   * every text delta received. Resolves with the conversation id after the
   * stream completes so later prompts continue the same persisted thread.
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
    let receivedContent = false;
    let currentEvent = "message";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === "") { currentEvent = "message"; continue; }
          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.slice(6).trim();
            continue;
          }
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          if (currentEvent === "error") {
            throw new Error(payload || "The assistant is unavailable right now.");
          }
          if (currentEvent === "conversation-id") {
            try {
              conversationIdResult = Number(payload);
              if (!Number.isFinite(conversationIdResult)) conversationIdResult = null;
            } catch {
              // Ignore unparseable conversation id.
            }
            continue;
          }
          const providerText = extractProviderReplyText(payload);
          if (providerText !== null) {
            if (providerText) { receivedContent = true; onChunk?.(providerText); }
          } else if (payload) {
            receivedContent = true;
            onChunk?.(payload);
          }
        }
      }
    } catch (err) {
      // Some runtimes (undici/Node, and occasionally browsers) throw a
      // "terminated"/network error when the server closes the SSE stream
      // after sending all data. If we already received content or a
      // conversation id, treat that as a normal completion rather than
      // failing the request.
      const msg = err instanceof Error ? err.message : String(err);
      const isTermination =
        /terminat/i.test(msg) ||
        /network/i.test(msg) ||
        /aborted/i.test(msg) ||
        /closed/i.test(msg);
      if (!(isTermination && receivedContent)) {
        throw err;
      }
      // Swallow benign stream-close errors.
    } finally {
      try { reader.releaseLock(); } catch { /* ignore */ }
    }

    return { conversationId: conversationIdResult };
  },
};
