package com.pranaveda.common.error;

/**
 * Upstream object-storage failure (Cloudinary unreachable, misconfigured, or
 * rejecting the upload). Mapped to 502 BAD_GATEWAY so the client can retry.
 *
 * <p>{@link ApiException} is abstract precisely so callers must choose a
 * concrete code; this class carries {@link ErrorCode#STORAGE_ERROR}.
 */
public class StorageException extends ApiException {

    public StorageException(String message) {
        super(ErrorCode.STORAGE_ERROR, message);
    }

    public StorageException(String message, Throwable cause) {
        super(ErrorCode.STORAGE_ERROR, message);
        initCause(cause);
    }
}
