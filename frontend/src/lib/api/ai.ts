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
  ): Promise<AiChatResponse> {
    return apiRequest<AiChatResponse>("/api/v1/ai/chat", {
      method: "POST",
      accessToken,
      body: { message, conversationId: conversationId ?? null },
    });
  },
};
