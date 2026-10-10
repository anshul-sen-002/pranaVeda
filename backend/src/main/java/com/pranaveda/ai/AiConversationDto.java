package com.pranaveda.ai;

import java.time.Instant;

/** Safe summary of a conversation thread for the history list. */
public record AiConversationDto(Long id, String title, Instant createdAt, Instant updatedAt) {

    static AiConversationDto from(AiConversation conversation) {
        return new AiConversationDto(conversation.getId(), conversation.getTitle(),
            conversation.getCreatedAt(), conversation.getUpdatedAt());
    }
}
