package com.pranaveda.ai;

import java.util.List;

/**
 * Provider-independent AI interface (agents.md 2.14). Business code never
 * talks to an SDK directly - swapping OpenRouter for another provider means
 * adding one implementation of this interface, nothing else changes.
 */
public interface AiProvider {

    /** A single conversational turn: the model reply plus usage metadata. */
    record AiReply(String content, String model, Integer promptTokens, Integer completionTokens) {
    }

    /** One history entry sent to the provider in order. */
    record ChatTurn(String role, String content) {
    }

    /**
     * Sends the conversation so far and returns the assistant reply.
     *
     * @param turns ordered history including the latest user message
     * @throws com.pranaveda.common.error.StorageException-style runtime errors on
     *         timeout/unavailability - implementations should raise
     *         {@code ApiException} with {@code ErrorCode#AI_UNAVAILABLE}
     */
    AiReply chat(List<ChatTurn> turns);
}
