package com.pranaveda.common.web;

import java.time.Instant;

import com.pranaveda.common.error.ApiError;
import com.pranaveda.common.error.ErrorCode;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.MDC;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Handles Spring Boot's {@code /error} path for API requests.
 *
 * <p>Spring Boot's {@code ErrorMvcAutoConfiguration} is excluded in
 * {@link com.pranaveda.PranaVedaApplication}, so {@code BasicErrorController}
 * is not registered. This controller is the sole handler for {@code /error}
 * and returns the uniform JSON error envelope instead of an HTML whitelabel
 * page. This prevents "Cannot render error page as the response has already
 * been committed" errors when an error occurs after the response has been
 * touched by a security exception handler.
 */
@RestController
@RequestMapping("/error")
public class ErrorController {

    @RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiError> handleError(HttpServletRequest request) {
        Integer statusCode = (Integer) request.getAttribute(
            jakarta.servlet.RequestDispatcher.ERROR_STATUS_CODE);
        String errorMessage = (String) request.getAttribute(
            jakarta.servlet.RequestDispatcher.ERROR_MESSAGE);
        String requestUri = (String) request.getAttribute(
            jakarta.servlet.RequestDispatcher.ERROR_REQUEST_URI);

        ErrorCode code = statusCode != null
            ? ErrorCode.fromHttpStatus(statusCode)
            : ErrorCode.INTERNAL_ERROR;

        String message = errorMessage != null ? errorMessage
            : "An unexpected error occurred.";
        String path = requestUri != null ? requestUri : request.getRequestURI();

        ApiError error = new ApiError(
            code, message, Instant.now(), path, MDC.get("correlationId"), null);

        return ResponseEntity.status(code.httpStatus()).body(error);
    }
}