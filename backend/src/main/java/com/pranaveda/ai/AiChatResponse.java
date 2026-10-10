package com.pranaveda.ai;

import java.time.Instant;
import java.util.List;

/**
 * Chat response: the assistant reply plus the (possibly new) conversation id
 * and the caller's full history so the client can render the thread.
 * {@code model} is server-recorded - never echoed from client input.
 */
public record AiChatResponse(
        Long conversationId,
        String reply,
        String model,
        Instant createdAt,
        List<AiMessageDto> messages) {

    public record AiMessageDto(Long id, AiRole role, String content, Instant createdAt) {

        static AiMessageDto from(AiMessage message) {
            return new AiMessageDto(message.getId(), message.getRole(),
                message.getContent(), message.getCreatedAt());
        }
    }
}
