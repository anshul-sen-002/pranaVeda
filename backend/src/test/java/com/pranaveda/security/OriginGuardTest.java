package com.pranaveda.security;

import com.pranaveda.common.error.ForbiddenException;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class OriginGuardTest {

    private final OriginGuard guard = new OriginGuard("http://localhost:3000, http://127.0.0.1:3000");

    @Test
    void allowsConfiguredOrigin() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Origin", "http://localhost:3000");
        assertThatCode(() -> guard.requireAllowedOrigin(request)).doesNotThrowAnyException();
    }

    @Test
    void allowsOwnOriginEvenWhenNotListed() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/refresh");
        request.setScheme("http");
        request.addHeader("Host", "localhost:8080");
        request.addHeader("Origin", "http://localhost:8080"); // Swagger UI scenario
        assertThatCode(() -> guard.requireAllowedOrigin(request)).doesNotThrowAnyException();
    }

    @Test
    void allowsRequestsWithoutOriginHeader() {
        // Native clients/curl do not send Origin - CSRF is browser-only.
        assertThatCode(() -> guard.requireAllowedOrigin(new MockHttpServletRequest()))
            .doesNotThrowAnyException();
    }

    @Test
    void rejectsForeignOrigin() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Origin", "https://evil.example");
        assertThatThrownBy(() -> guard.requireAllowedOrigin(request))
            .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void rejectsNullOriginLiteral() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Origin", "null"); // sandboxed iframe origin
        assertThatThrownBy(() -> guard.requireAllowedOrigin(request))
            .isInstanceOf(ForbiddenException.class);
    }
}
