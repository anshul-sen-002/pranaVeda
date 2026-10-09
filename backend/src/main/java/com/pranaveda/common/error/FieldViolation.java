package com.pranaveda.common.error;

/** A single field-level validation failure inside an error envelope. */
public record FieldViolation(String field, String message) {
}
