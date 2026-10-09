package com.pranaveda.security;

import java.io.IOException;
import java.time.Instant;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pranaveda.common.error.ApiError;
import com.pranaveda.common.error.ErrorCode;
import com.pranaveda.common.web.CorrelationIdFilter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.MDC;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

/** Turns authorization failures into the uniform JSON error envelope (403 FORBIDDEN). */
public class ApiAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public ApiAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        ApiError error = new ApiError(
            ErrorCode.FORBIDDEN, "You do not have access to this resource.",
            Instant.now(), request.getRequestURI(), MDC.get(CorrelationIdFilter.MDC_KEY), null);
        response.setStatus(ErrorCode.FORBIDDEN.httpStatus());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), error);
    }
}
