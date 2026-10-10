package com.pranaveda.common.error;

/**
 * AI provider unavailable: missing API key, timeout, upstream 4xx/5xx, or a
 * malformed provider response. Mapped to 503 SERVICE_UNAVAILABLE so clients
 * can show a calm fallback without leaking provider internals or prompts.
 */
public class AiUnavailableException extends ApiException {

    public AiUnavailableException(String message) {
        super(ErrorCode.AI_UNAVAILABLE, message);
    }

    public AiUnavailableException(String message, Throwable cause) {
        super(ErrorCode.AI_UNAVAILABLE, message);
        initCause(cause);
    }
}
