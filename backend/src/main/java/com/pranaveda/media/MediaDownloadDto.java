package com.pranaveda.media;

/**
 * Authorized download descriptor (agents.md 2.7). Carries the delivery URL
 * plus enough metadata for the client to set a proper filename and
 * Content-Disposition. Never exposes storage credentials or a permanent
 * private-bucket URL - {@code url} is the provider's secure delivery URL,
 * only returned after the service re-checks auth, availability, and permission.
 */
public record MediaDownloadDto(
        String url,
        String filename,
        String contentType,
        Long bytes) {
}
