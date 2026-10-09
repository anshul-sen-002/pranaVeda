package com.pranaveda.common.error;

import org.springframework.http.HttpStatus;

/**
 * Machine-readable error codes shared by the API and the frontend.
 * The HTTP status travels on the status line; this code travels in the body
 * (agents.md section 4). Order is informational only.
 */
public enum ErrorCode {
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED),
    FORBIDDEN(HttpStatus.FORBIDDEN),
    NOT_FOUND(HttpStatus.NOT_FOUND),
    CONFLICT(HttpStatus.CONFLICT),
    RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS),
    PAYLOAD_TOO_LARGE(HttpStatus.CONTENT_TOO_LARGE), // Framework 7 rename of PAYLOAD_TOO_LARGE
    UNSUPPORTED_MEDIA_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR);

    private final HttpStatus status;

    ErrorCode(HttpStatus status) {
        this.status = status;
    }

    public HttpStatus status() {
        return status;
    }

    public int httpStatus() {
        return status.value();
    }
}
