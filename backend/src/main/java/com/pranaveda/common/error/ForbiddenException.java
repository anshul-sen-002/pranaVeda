package com.pranaveda.common.error;

/** 403 - authenticated, but the role/ownership rules deny this operation. */
public class ForbiddenException extends ApiException {

    public ForbiddenException(String message) {
        super(ErrorCode.FORBIDDEN, message);
    }
}
