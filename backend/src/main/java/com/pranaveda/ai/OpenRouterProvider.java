package com.pranaveda.ai;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

import com.pranaveda.common.error.AiUnavailableException;
import com.pranaveda.common.error.ApiException;
import com.pranaveda.common.error.ErrorCode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
                "The AI companion is not configured. Set the OPENROUTER_API_KEY environment variable.");
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
                "The AI companion is not configured. Set the OPENROUTER_API_KEY environment variable.");
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
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("AI stream provider returned status {} body={}", response.statusCode(), truncate(response.body()));
                throw new AiUnavailableException("The AI companion is temporarily unavailable.");
            }
            parseStream(response.body(), onChunk);
        } catch (ApiException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new AiUnavailableException("The AI request was interrupted.");
        } catch (Exception ex) {
            log.warn("AI stream provider call failed", ex);
            throw new AiUnavailableException("The AI companion is temporarily unavailable.", ex);
        }
    }

    // --- JSON helpers ------------------------------------------------------

    private String writeJson(Object value) {
        return mapper.writeValueAsString(value);
    }

    private void parseStream(String sseBody, Consumer<String> onChunk) {
        String[] lines = sseBody.split("\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            String payload = trimmed.substring("data:".length()).trim();
            if ("[DONE]".equals(payload)) continue;
            try {
                Map<String, Object> root = mapper.readValue(payload, Map.class);
                Object choices = root.get("choices");
                if (!(choices instanceof List<?> list) || list.isEmpty()) continue;
                Map<String, Object> first = (Map<String, Object>) list.get(0);
                Map<String, Object> delta = (Map<String, Object>) first.get("delta");
                if (delta == null) continue;
                Object content = delta.get("content");
                if (content != null && !content.toString().isBlank()) {
                    onChunk.accept(content.toString());
                }
            } catch (Exception ignored) {
                // Skip malformed chunks; keep streaming resilient.
            }
        }
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
