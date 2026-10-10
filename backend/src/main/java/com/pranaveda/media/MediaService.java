package com.pranaveda.media;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.user.User;
import com.pranaveda.user.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Orchestrates validated uploads: server-side type/size checks (agents.md 2.15),
 * provider upload via {@link StorageService}, and {@code media_assets} metadata
 * persistence. Owns the profile-photo lifecycle for the signed-in user.
 *
 * <p>Ownership rule: personal uploads resolve the owner from the security
 * context via {@link CurrentUserPrincipal} - never from client-supplied IDs.
 */
@Service
public class MediaService {

    private final StorageService storage;
    private final MediaRepository media;
    private final UserRepository users;
    private final MediaProperties properties;

    public MediaService(StorageService storage, MediaRepository media,
                        UserRepository users, MediaProperties properties) {
        this.storage = storage;
        this.media = media;
        this.users = users;
        this.properties = properties;
    }

    /** ADMIN: validates and stores an asset, persisting safe metadata. */
    @Transactional
    public MediaDto uploadForAdmin(MultipartFile file, MediaKind kind, Long contentId, Long createdBy) {
        if (kind == MediaKind.PROFILE_IMAGE) {
            throw new BadRequestException("Profile photos are uploaded through /me/profile-photo.");
        }
        byte[] bytes = readAndValidate(file, kind);
        StoredMedia stored = storage.upload(bytes, folderFor(kind), generatePublicId(kind), resourceTypeFor(kind));

        MediaAsset asset = new MediaAsset();
        asset.setKind(kind);
        asset.setPublicId(stored.publicId());
        asset.setSecureUrl(stored.secureUrl());
        asset.setResourceType(stored.resourceType());
        asset.setFormat(stored.format() != null ? stored.format() : guessFormat(file.getContentType()));
        asset.setBytes(stored.bytes());
        asset.setWidth(stored.width());
        asset.setHeight(stored.height());
        asset.setDurationSecs(stored.durationSecs());
        asset.setOriginalName(safeOriginalName(file.getOriginalFilename()));
        asset.setContentId(contentId);
        asset.setCreatedBy(createdBy);
        return MediaDto.from(media.save(asset));
    }

    /** Signed-in user: replaces (or sets) their profile photo. */
    @Transactional
    public ProfilePhotoDto setProfilePhoto(MultipartFile file) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        byte[] bytes = readAndValidate(file, MediaKind.PROFILE_IMAGE);

        User user = users.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found."));

        String previousPublicId = user.getProfileImagePublicId();
        if (previousPublicId != null && !previousPublicId.isBlank()) {
            storage.delete(previousPublicId, "image"); // best-effort
        }

        // Stable per-user public id so replacement overwrites the same object.
        StoredMedia stored = storage.uploadImage(bytes, "profile", "user-" + userId + "/photo");

        MediaAsset asset = new MediaAsset();
        asset.setKind(MediaKind.PROFILE_IMAGE);
        asset.setPublicId(stored.publicId());
        asset.setSecureUrl(stored.secureUrl());
        asset.setResourceType(stored.resourceType());
        asset.setFormat(stored.format() != null ? stored.format() : guessFormat(file.getContentType()));
        asset.setBytes(stored.bytes());
        asset.setWidth(stored.width());
        asset.setHeight(stored.height());
        asset.setOriginalName(safeOriginalName(file.getOriginalFilename()));
        asset.setOwnerId(userId);
        asset.setCreatedBy(userId);
        media.save(asset);

        user.setProfileImageUrl(stored.secureUrl());
        user.setProfileImagePublicId(stored.publicId());
        users.save(user);
        return new ProfilePhotoDto(stored.secureUrl());
    }

    /** Signed-in user: removes their profile photo. Idempotent. */
    @Transactional
    public void clearProfilePhoto() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        User user = users.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found."));
        String publicId = user.getProfileImagePublicId();
        if (publicId != null && !publicId.isBlank()) {
            storage.delete(publicId, "image");
        }
        user.setProfileImageUrl(null);
        user.setProfileImagePublicId(null);
        users.save(user);
    }

    /** Current photo URL for the signed-in user, or empty when unset. */
    @Transactional(readOnly = true)
    public Optional<String> currentProfilePhotoUrl() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        return users.findById(userId).map(User::getProfileImageUrl);
    }

    // --- validation helpers ------------------------------------------------

    private byte[] readAndValidate(MultipartFile file, MediaKind kind) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was provided.");
        }
        long maxBytes = maxBytesFor(kind);
        if (file.getSize() > maxBytes) {
            throw new BadRequestException("File exceeds the maximum allowed size of " + maxBytes + " bytes.");
        }
        String contentType = normalize(file.getContentType());
        if (!allowedTypesFor(kind).contains(contentType)) {
            throw new BadRequestException("Content type '" + contentType + "' is not accepted for "
                + kind + ". Allowed: " + allowedTypesFor(kind) + ".");
        }
        try {
            return file.getBytes();
        } catch (Exception ex) {
            throw new BadRequestException("Could not read the uploaded file.");
        }
    }

    private long maxBytesFor(MediaKind kind) {
        return switch (kind) {
            case PROFILE_IMAGE, CONTENT_IMAGE -> properties.maxImageBytes();
            case VIDEO -> properties.maxVideoBytes();
            case AUDIO -> properties.maxAudioBytes();
        };
    }

    private List<String> allowedTypesFor(MediaKind kind) {
        return switch (kind) {
            case PROFILE_IMAGE, CONTENT_IMAGE -> properties.allowedImageTypes();
            case VIDEO -> properties.allowedVideoTypes();
            case AUDIO -> properties.allowedAudioTypes();
        };
    }

    private static String resourceTypeFor(MediaKind kind) {
        return switch (kind) {
            case PROFILE_IMAGE, CONTENT_IMAGE -> "image";
            case VIDEO -> "video";
            case AUDIO -> "raw"; // Cloudinary delivers audio as a raw resource
        };
    }

    private static String folderFor(MediaKind kind) {
        return switch (kind) {
            case PROFILE_IMAGE -> "profile";
            case CONTENT_IMAGE -> "content/images";
            case VIDEO -> "content/video";
            case AUDIO -> "content/audio";
        };
    }

    /** Generated storage key - never derived from the original filename. */
    private static String generatePublicId(MediaKind kind) {
        return kind.name().toLowerCase(Locale.ROOT) + "-" + UUID.randomUUID();
    }

    private static String normalize(String contentType) {
        return contentType == null ? "" : contentType.split(";")[0].trim().toLowerCase(Locale.ROOT);
    }

    private static String guessFormat(String contentType) {
        String normalized = normalize(contentType);
        int slash = normalized.lastIndexOf('/');
        return slash >= 0 && slash < normalized.length() - 1
            ? normalized.substring(slash + 1) : null;
    }

    private static String safeOriginalName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        String base = name.replace('\\', '/');
        int slash = base.lastIndexOf('/');
        base = slash >= 0 ? base.substring(slash + 1) : base;
        return base.length() > 255 ? base.substring(0, 255) : base;
    }
}
