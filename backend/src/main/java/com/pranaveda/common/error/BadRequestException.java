package com.pranaveda.common.error;

/** 400 - request syntactically valid but semantically wrong (bad filter value, unknown slug reference). */
public class BadRequestException extends ApiException {

    public BadRequestException(String message) {
        super(ErrorCode.VALIDATION_FAILED, message);
    }
}
