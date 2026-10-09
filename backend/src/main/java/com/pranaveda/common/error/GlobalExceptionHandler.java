package com.pranaveda.common.error;

import java.time.Instant;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * The single place where every failure becomes the uniform error envelope
 * (docs/architecture.md section 13). Responses never contain stack traces,
 * SQL, secrets, or provider output; full details go to the log with the
 * correlation id.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        List<FieldViolation> violations = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new FieldViolation(fe.getField(), fe.getDefaultMessage()))
                .toList();
        return body(ErrorCode.VALIDATION_FAILED, "Request validation failed.", request, violations);
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiError> handleApiException(ApiException ex, HttpServletRequest request) {
        log.debug("API exception on {} {}: {} [correlationId={}]",
                request.getMethod(), request.getRequestURI(), ex.getMessage(), MDC.get("correlationId"));
        return body(ex.code(), ex.getMessage(), request, null);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex,
            HttpServletRequest request) {
        return body(ErrorCode.VALIDATION_FAILED, "Malformed request body.", request, null);
    }

    /**
     * Enum/number query parameters that fail conversion ({@code ?type=BOGUS})
     * become a field-level validation envelope instead of an empty 400.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
            HttpServletRequest request) {
        String field = ex.getName();
        String value = String.valueOf(ex.getValue());
        if (value.length() > 100) {
            value = value.substring(0, 100) + "...";
        }
        String message = "Invalid value '" + value + "' for parameter '" + field + "'.";
        return body(ErrorCode.VALIDATION_FAILED, message, request,
                List.of(new FieldViolation(field, message)));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(AuthenticationException ex,
            HttpServletRequest request) {
        return body(ErrorCode.UNAUTHENTICATED, "Authentication failed.", request, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex,
            HttpServletRequest request) {
        return body(ErrorCode.FORBIDDEN, "You do not have access to this resource.", request, null);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> handleNoResource(NoResourceFoundException ex,
            HttpServletRequest request) {
        return body(ErrorCode.NOT_FOUND, "Resource not found.", request, null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request) {
        return body(ErrorCode.VALIDATION_FAILED, "HTTP method not supported for this endpoint.", request, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception on {} {} [correlationId={}]",
                request.getMethod(), request.getRequestURI(), MDC.get("correlationId"), ex);
        return body(ErrorCode.INTERNAL_ERROR, "An unexpected error occurred.", request, null);
    }

    private static ResponseEntity<ApiError> body(ErrorCode code, String message,
            HttpServletRequest request,
            List<FieldViolation> violations) {
        ApiError error = new ApiError(
                code, message, Instant.now(), request.getRequestURI(), MDC.get("correlationId"), violations);
        return ResponseEntity.status(code.status()).body(error);
    }
}
