package com.pranaveda.media;

/**
 * Provider-independent object storage (architecture section 9). The rest of the
 * application never talks to a storage SDK directly - it depends on this
 * interface, so the provider can be swapped (local disk in tests, S3 in prod)
 * without touching business logic.
 *
 * <p>Credentials stay server-side inside the implementation. This interface
 * only exposes generated object references ({@link StoredMedia}) and deletion
 * by public id.
 */
public interface StorageService {

    /**
     * Uploads bytes and returns the stored object reference.
     *
     * @param bytes        raw content to store
     * @param folder       logical folder/prefix (e.g. "profile", "content")
     * @param publicId     desired object id (unique; the provider may qualify it)
     * @param resourceType Cloudinary resource type: "image", "video", or "raw"
     * @return metadata for the stored object
     */
    StoredMedia upload(byte[] bytes, String folder, String publicId, String resourceType);

    /** Deletes a previously stored object. Missing objects are ignored. */
    void delete(String publicId, String resourceType);

    /**
     * Uploads and returns the reference for an image with sensible Cloudinary
     * defaults (no bytes over the network, generate a width-capped delivery
     * URL). Convenience over {@link #upload}.
     */
    default StoredMedia uploadImage(byte[] bytes, String folder, String publicId) {
        return upload(bytes, folder, publicId, "image");
    }
}
