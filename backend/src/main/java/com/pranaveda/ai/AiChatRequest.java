package com.pranaveda.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Chat request. {@code conversationId} is null for a brand-new thread; when
 * supplied it must belong to the caller (re-checked in the service).
 */
public record AiChatRequest(
        Long conversationId,
        @NotBlank @Size(max = 4000) String message) {
}
