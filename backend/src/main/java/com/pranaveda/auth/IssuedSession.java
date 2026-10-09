package com.pranaveda.auth;

/**
 * Everything an auth flow produces: the JSON body plus the plaintext refresh
 * token that the controller must put into the HttpOnly cookie.
 */
public record IssuedSession(TokenResponse response, String refreshToken) {
}
