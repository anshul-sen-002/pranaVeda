package com.pranaveda.auth;

/**
 * Response body of register/login/refresh.
 * The refresh token is deliberately NOT part of it - it travels only in the
 * HttpOnly cookie.
 */
public record TokenResponse(String accessToken, String tokenType, long expiresIn, UserSummary user) {
}
