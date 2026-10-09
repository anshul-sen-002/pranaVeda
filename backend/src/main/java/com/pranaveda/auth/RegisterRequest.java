package com.pranaveda.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Public registration - always creates a USER; role is never accepted here. */
public record RegisterRequest(
    @NotBlank @Email @Size(max = 320) String email,
    @NotBlank @Size(min = 8, max = 72) String password,
    @NotBlank @Size(min = 2, max = 80) String displayName) {
}
