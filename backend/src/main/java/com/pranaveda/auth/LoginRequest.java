package com.pranaveda.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Credentials are verified server-side; no role or identity fields exist. */
public record LoginRequest(
    @NotBlank @Email @Size(max = 320) String email,
    @NotBlank @Size(max = 72) String password) {
}
