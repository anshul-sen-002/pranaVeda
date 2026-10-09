package com.pranaveda.common.error;

/** 409 - the request conflicts with existing state (duplicate email, slug, bookmark...). */
public class ConflictException extends ApiException {

    public ConflictException(String message) {
        super(ErrorCode.CONFLICT, message);
    }
}
