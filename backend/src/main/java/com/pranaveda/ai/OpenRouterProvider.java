package com.pranaveda.ai;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.ResponseInfo;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Flow;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

import com.pranaveda.common.error.AiUnavailableException;
import com.pranaveda.common.error.ApiException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import tools.jackson.databind.json.JsonMapper;

/**
 * OpenAI-compatible chat-completions client for OpenRouter (architecture
 * section 9, agents.md 2.14). The API key stays server-side. Timeouts and
 * failure mapping are applied here so callers only see domain results.
 *
 * <p>Uses the JDK {@link HttpClient} - no extra dependency. All provider
 * errors (timeout, 4xx/5xx, malformed body) are collapsed into a single
 * {@code AI_UNAVAILABLE} so no internal prompt or key ever leaks to clients.
 */
@Component
@Primary
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "openrouter", matchIfMissing = true)
public class OpenRouterProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenRouterProvider.class);

    private final AiProperties properties;
    private final JsonMapper mapper;
    private final HttpClient http;

    public OpenRouterProvider(AiProperties properties, JsonMapper mapper) {
        this.properties = properties;
        this.mapper = mapper;
        this.http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(Math.max(5, properties.timeoutSeconds())))
            .build();
    }

    @Override
    public AiReply chat(List<ChatTurn> turns) {
        if (!properties.isConfigured()) {
            throw new AiUnavailableException(
                "The AI companion is not configured. Set the app.ai.api-key property.");
        }

        List<Map<String, String>> messages = turns.stream()
            .map(turn -> Map.of("role", turn.role(), "content", turn.content()))
            .toList();

        Map<String, Object> body = Map.of(
            "model", properties.model(),
            "messages", messages,
            "max_tokens", properties.maxTokens());

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(properties.baseUrl().replaceAll("/+$", "") + "/chat/completions"))
            .timeout(Duration.ofSeconds(properties.timeoutSeconds()))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + properties.apiKey())
            // OpenRouter attribution headers (recommended by their docs).
            .header("HTTP-Referer", "https://pranaveda.app")
            .header("X-Title", "PranaVeda")
            .POST(HttpRequest.BodyPublishers.ofString(writeJson(body)))
            .build();

        try {
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("AI provider returned status {} body={}", response.statusCode(), truncate(response.body()));
                throw new AiUnavailableException("The AI companion is temporarily unavailable.");
            }
            return parseReply(response.body());
        } catch (ApiException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new AiUnavailableException("The AI request was interrupted.");
        } catch (Exception ex) {
            log.warn("AI provider call failed", ex);
            throw new AiUnavailableException("The AI companion is temporarily unavailable.", ex);
        }
    }

    @Override
    public void streamChat(List<ChatTurn> turns, String language, Consumer<String> onChunk) {
        if (!properties.isConfigured()) {
            throw new AiUnavailableException(
                "The AI companion is not configured. Set the app.ai.api-key property.");
        }

        List<Map<String, String>> messages = turns.stream()
            .map(turn -> Map.of("role", turn.role(), "content", turn.content()))
            .toList();

        // Language instruction prepended as a system hint when a language is selected.
        if (language != null && !language.isBlank()) {
            String hint = Map.of(
                "en", "Reply in English.",
                "es", "Responde en español.",
                "fr", "Répondez en français.",
                "de", "Antworten Sie auf Deutsch.",
                "hi", "हिन्दी में उत्तर दें।",
                "ja", "日本語で返信してください。",
                "ko", "한국어로 답변해 주세요."
            ).getOrDefault(language.toLowerCase(), "Reply in " + language + ".");
            List<Map<String, String>> withHint = new ArrayList<>();
            withHint.add(Map.of("role", "system", "content", hint));
            withHint.addAll(messages);
            messages = withHint;
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", properties.model());
        body.put("messages", messages);
        body.put("max_tokens", properties.maxTokens());
        body.put("stream", true);

        String jsonBody = writeJson(body);
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(properties.baseUrl().replaceAll("/+$", "") + "/chat/completions"))
            .timeout(Duration.ofSeconds(properties.timeoutSeconds()))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + properties.apiKey())
            .header("HTTP-Referer", "https://pranaveda.app")
            .header("X-Title", "PranaVeda")
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();

        try {
            // Use sendAsync with a BodyHandler that returns a custom
            // BodySubscriber. SSE data lines are forwarded to onChunk as they
            // arrive from OpenRouter. The getBody() future completes only when
            // the stream is fully consumed ([DONE] received or error), so
            // .join() blocks until all chunks have been delivered to onChunk.
            CompletableFuture<HttpResponse<Void>> responseFuture = http.sendAsync(request,
                (ResponseInfo responseInfo) -> {
                    int status = responseInfo.statusCode();
                    if (status < 200 || status >= 300) {
                        return HttpResponse.BodySubscribers.discarding();
                    }
                    return new SseLineSubscriber(onChunk);
                });

            HttpResponse<Void> response = responseFuture.join();

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("AI stream provider returned status {}", response.statusCode());
                throw new AiUnavailableException("The AI companion is temporarily unavailable.");
            }
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("AI stream provider call failed", ex);
            throw new AiUnavailableException("The AI companion is temporarily unavailable.", ex);
        }
    }

    /** SSE line subscriber: forwards OpenRouter {@code data:} lines to onChunk as they arrive.
     *  The {@link #getBody()} future completes only when the stream is fully consumed,
     *  ensuring {@code sendAsync().join()} blocks until all chunks have been delivered.
     *  Tracks how many chunks were delivered so stream cancellation after partial
     *  delivery can be treated as a normal (not error) completion. */
    private static final class SseLineSubscriber implements HttpResponse.BodySubscriber<Void> {
        private final Consumer<String> onChunk;
        private final StringBuilder buffer = new StringBuilder();
        private final CompletableFuture<Void> bodyFuture = new CompletableFuture<>();
        private Flow.Subscription subscription;
        private volatile boolean done = false;
        private int chunksDelivered = 0;

        SseLineSubscriber(Consumer<String> onChunk) {
            this.onChunk = onChunk;
        }

        /** Returns the number of chunks already delivered to onChunk. */
        int chunksDelivered() {
            return chunksDelivered;
        }

        @Override
        public void onSubscribe(Flow.Subscription subscription) {
            this.subscription = subscription;
            subscription.request(Long.MAX_VALUE);
        }

        @Override
        public void onNext(List<java.nio.ByteBuffer> items) {
            if (done) return;
            for (java.nio.ByteBuffer bb : items) {
                int len = bb.remaining();
                byte[] bytes = new byte[len];
                bb.get(bytes);
                buffer.append(new String(bytes, java.nio.charset.StandardCharsets.UTF_8));
            }
            drainBuffer();
        }

        private void drainBuffer() {
            String content = buffer.toString();
            int nl;
            while ((nl = content.indexOf('\n')) >= 0) {
                String line = content.substring(0, nl);
                content = content.substring(nl + 1);
                processLine(line);
            }
            buffer.setLength(0);
            buffer.append(content);
        }

        private void processLine(String line) {
            String trimmed = line.trim();
            if (!trimmed.startsWith("data:")) return;
            String payload = trimmed.substring(5).trim();
            if ("[DONE]".equals(payload)) {
                done = true;
                if (subscription != null) {
                    subscription.cancel();
                }
                bodyFuture.complete(null);
                return;
            }
            if (!payload.isBlank()) {
                onChunk.accept(payload);
                chunksDelivered++;
            }
        }

        @Override
        public void onError(Throwable throwable) {
            done = true;
            log.warn("AI stream provider call failed", throwable);
            bodyFuture.completeExceptionally(throwable);
        }

        @Override
        public void onComplete() {
            done = true;
            drainBuffer();
            if (!bodyFuture.isDone()) {
                bodyFuture.complete(null);
            }
        }

        @Override
        public CompletionStage<Void> getBody() {
            return bodyFuture;
        }
    }

    // --- JSON helpers ------------------------------------------------------

    private String writeJson(Object value) {
        return mapper.writeValueAsString(value);
    }

    @SuppressWarnings("unchecked")
    private AiReply parseReply(String json) {
        Map<String, Object> root = mapper.readValue(json, Map.class);
        Object model = root.get("model");

        Object choices = root.get("choices");
        if (!(choices instanceof List<?> list) || list.isEmpty()) {
            throw new AiUnavailableException("The AI companion returned an empty response.");
        }
        Map<String, Object> first = (Map<String, Object>) list.get(0);
        Map<String, Object> message = (Map<String, Object>) first.get("message");
        Object content = message != null ? message.get("content") : null;
        if (content == null || content.toString().isBlank()) {
            throw new AiUnavailableException("The AI companion returned an empty response.");
        }

        Integer promptTokens = null;
        Integer completionTokens = null;
        Object usage = root.get("usage");
        if (usage instanceof Map<?, ?> usageMap) {
            promptTokens = toInt(usageMap.get("prompt_tokens"));
            completionTokens = toInt(usageMap.get("completion_tokens"));
        }

        return new AiReply(content.toString(),
            model != null ? model.toString() : properties.model(),
            promptTokens, completionTokens);
    }

    private static Integer toInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return null;
    }

    private static String truncate(String value) {
        if (value == null) {
            return "";
        }
        return value.length() > 300 ? value.substring(0, 300) + "..." : value;
    }
}
