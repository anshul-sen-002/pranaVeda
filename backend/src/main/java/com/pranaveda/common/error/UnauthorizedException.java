package com.pranaveda.common.error;

/**
 * 401 - missing, invalid, or expired credentials.
 * Use the two-argument constructor with {@link ErrorCode#TOKEN_EXPIRED} when
 * the failure is specifically an expired access token.
 */
public class UnauthorizedException extends ApiException {

    public UnauthorizedException(String message) {
        super(ErrorCode.UNAUTHENTICATED, message);
    }

    public UnauthorizedException(ErrorCode code, String message) {
        super(code, message);
    }
}
