package com.pranaveda.ai;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * AI wellness companion endpoints (agents.md 2.14). All routes live under
 * {@code /api/v1/ai/**} which the security chain restricts to authenticated
 * users, and every conversation is additionally re-checked for ownership in
 * the service layer. History is an explicit, disclosed, user-deletable feature.
 */
@Tag(name = "AI companion")
@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    /** Sends a message and returns the reply plus the updated thread. */
    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(aiService.chat(request));
    }

    /** Streams the assistant reply as Server-Sent Events (text/event-stream). */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(@Valid @RequestBody AiChatRequest request) {
        SseEmitter emitter = new SseEmitter(30_000L);
        List<String> chunks = new CopyOnWriteArrayList<>();

        AiChatResponse response = aiService.streamChat(request, chunk -> {
            chunks.add(chunk);
            try {
                emitter.send(SseEmitter.event().data(chunk));
            } catch (Exception ignored) {
                // Client may have disconnected.
            }
        });

        // Send completion marker once the full reply has been collected.
        try {
            emitter.send(SseEmitter.event().data("[DONE]"));
        } catch (Exception ignored) {
            // Ignore.
        }

        // Send the conversation id so the client can continue the thread.
        if (response.conversationId() != null) {
            try {
                emitter.send(SseEmitter.event().name("conversation-id").data(String.valueOf(response.conversationId())));
            } catch (Exception ignored) {
                // Ignore.
            }
        }
        emitter.complete();

        return emitter;
    }

    /** The caller's conversation history, newest first. */
    @GetMapping("/conversations")
    public List<AiConversationDto> listConversations() {
        return aiService.listConversations();
    }

    /** One owned conversation with its full message history. */
    @GetMapping("/conversations/{id}")
    public AiChatResponse getConversation(@PathVariable long id) {
        return aiService.getConversation(id);
    }

    /** Deletes one owned conversation. Idempotent. */
    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable long id) {
        aiService.deleteConversation(id);
        return ResponseEntity.noContent().build();
    }
}
