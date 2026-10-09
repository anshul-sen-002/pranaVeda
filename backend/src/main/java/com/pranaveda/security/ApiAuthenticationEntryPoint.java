package com.pranaveda.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

import com.pranaveda.common.error.ApiError;
import com.pranaveda.common.error.ErrorCode;
import com.pranaveda.common.web.CorrelationIdFilter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.MDC;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import tools.jackson.databind.json.JsonMapper;

/**
 * Turns "authentication required / token invalid" into the uniform JSON error
 * envelope instead of a login page or empty 401.
 */
public class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final JsonMapper objectMapper;

    public ApiAuthenticationEntryPoint(JsonMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        String reason = (String) request.getAttribute(JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE);
        ErrorCode code = "TOKEN_EXPIRED".equals(reason) ? ErrorCode.TOKEN_EXPIRED : ErrorCode.UNAUTHENTICATED;
        String message = code == ErrorCode.TOKEN_EXPIRED
            ? "Access token expired."
            : "Authentication required.";

        ApiError error = new ApiError(
            code, message, Instant.now(), request.getRequestURI(), MDC.get(CorrelationIdFilter.MDC_KEY), null);
        response.setStatus(code.httpStatus());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getOutputStream().write(
            objectMapper.writeValueAsString(error).getBytes(StandardCharsets.UTF_8));
    }
}
