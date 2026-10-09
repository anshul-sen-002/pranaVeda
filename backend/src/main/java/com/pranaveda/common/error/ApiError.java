package com.pranaveda.common.error;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Uniform error envelope returned by every non-2xx response.
 * Never contains stack traces, SQL, secrets, or provider output.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
    ErrorCode code,
    String message,
    Instant timestamp,
    String path,
    String correlationId,
    List<FieldViolation> fieldErrors) {
}
