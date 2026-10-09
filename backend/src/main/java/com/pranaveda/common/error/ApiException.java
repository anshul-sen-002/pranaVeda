package com.pranaveda.common.error;

import org.springframework.http.HttpStatus;

/**
 * Base class for exceptions that map directly to the API error envelope.
 * Thrown from the service layer; handled by {@link GlobalExceptionHandler}.
 * All subclasses map to 4xx codes - unexpected 5xx failures use the generic
 * handler instead.
 */
public abstract class ApiException extends RuntimeException {

    private final ErrorCode code;

    protected ApiException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public ErrorCode code() {
        return code;
    }

    public HttpStatus status() {
        return code.status();
    }
}
