package com.pranaveda.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * AI companion settings (agents.md 2.14). Bound from {@code app.ai.*}. The
 * provider API key never leaves the server and is never exposed to clients.
 * When no key is configured the chat endpoint reports AI_UNAVAILABLE instead
 * of failing the whole application startup.
 */
@ConfigurationProperties(prefix = "app.ai")
public record AiProperties(
        String provider,
        String baseUrl,
        String apiKey,
        String model,
        int maxTokens,
        int timeoutSeconds,
        int maxMessageChars) {

    public AiProperties {
        if (provider == null || provider.isBlank()) {
            provider = "openrouter";
        }
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "https://openrouter.ai/api/v1";
        }
        if (model == null || model.isBlank()) {
            model = "openai/gpt-4o-mini";
        }
        if (maxTokens <= 0) {
            maxTokens = 1024;
        }
        if (timeoutSeconds <= 0) {
            timeoutSeconds = 30;
        }
        if (maxMessageChars <= 0) {
            maxMessageChars = 4000;
        }
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
