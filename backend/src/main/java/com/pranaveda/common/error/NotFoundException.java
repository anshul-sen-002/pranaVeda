package com.pranaveda.common.error;

/** 404 - the addressed resource does not exist (or is not visible to the caller). */
public class NotFoundException extends ApiException {

    public NotFoundException(String message) {
        super(ErrorCode.NOT_FOUND, message);
    }
}
