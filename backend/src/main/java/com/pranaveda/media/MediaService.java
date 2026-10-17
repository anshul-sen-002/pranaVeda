package com.pranaveda.media;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import javax.imageio.ImageIO;

import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.ForbiddenException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.common.error.StorageException;
import com.pranaveda.content.ContentRepository;
import com.pranaveda.content.ContentStatus;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.user.Role;
import com.pranaveda.user.User;
import com.pranaveda.user.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Orchestrates validated uploads: server-side type/size checks (agents.md 2.15),
 * provider upload via {@link StorageService}, and {@code media_assets} metadata
 * persistence. Owns the profile-photo lifecycle and authorized downloads for
 * the signed-in user.
 *
 * <p>Ownership rule: personal uploads and downloads resolve the owner from the
 * security context via {@link CurrentUserPrincipal} - never from client-supplied IDs.
 */
@Service
public class MediaService {

    private final StorageService storage;
    private final MediaRepository media;
    private final UserRepository users;
    private final MediaProperties properties;
    private final ContentRepository contentRepository;

    public MediaService(StorageService storage, MediaRepository media,
                        UserRepository users, MediaProperties properties,
                        ContentRepository contentRepository) {
        this.storage = storage;
        this.media = media;
        this.users = users;
        this.properties = properties;
        this.contentRepository = contentRepository;
    }

    /** ADMIN: validates and stores an asset, persisting safe metadata. */
    @Transactional
    public MediaDto uploadForAdmin(MultipartFile file, MediaKind kind, Long contentId, Long createdBy) {
        if (kind == MediaKind.PROFILE_IMAGE) {
            throw new BadRequestException("Profile photos are uploaded through /me/profile-photo.");
        }
        if (kind == MediaKind.CONTENT_IMAGE && contentId != null) {
            requireContentExists(contentId);
        }
        byte[] bytes = readAndValidate(file, kind);
        StoredMedia stored;
        if (kind == MediaKind.CONTENT_IMAGE) {
            // Eager width-capped derivative: cards render ~800 px wide at most,
            // so the delivery URL serves the capped variant, not the raw upload.
            java.util.Map<String, Object> capped = new java.util.LinkedHashMap<>();
            capped.put("width", 1600);
            capped.put("crop", "limit");
            capped.put("fetch_format", "auto");
            capped.put("quality", "auto:good");
            stored = storage.upload(bytes, folderFor(kind), generatePublicId(kind),
                    resourceTypeFor(kind), java.util.List.of(capped));
        } else {
            stored = storage.upload(bytes, folderFor(kind), generatePublicId(kind), resourceTypeFor(kind));
        }

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

    /** Rejects linking an upload to content that does not exist. */
    private void requireContentExists(Long contentId) {
        if (!contentRepository.existsById(contentId)) {
            throw new BadRequestException("No content item exists with id " + contentId + ".");
        }
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

    /**
     * Authorized download (agents.md 2.7). Public streaming and authenticated
     * downloading are separate permissions, so this re-checks three things
     * server-side regardless of what the UI shows:
     *
     * <ol>
     *   <li>authentication (route is {@code /me/**}, resolved here),</li>
     *   <li>content availability - linked content must be PUBLISHED for a
     *       non-admin, so drafts/archived never leak through media,</li>
     *   <li>download permission - the asset's {@code downloadable} flag, and
     *       for owner-private kinds (profile images) the owner match.</li>
     * </ol>
     *
     * @return a short-lived signed download descriptor (never the raw
     *         credentials or a permanent private bucket URL)
     */
    @Transactional(readOnly = true)
    public MediaDownloadDto download(long mediaId) {
        CurrentUserPrincipal principal = CurrentUserPrincipal.requireCurrent();
        MediaAsset asset = media.findById(mediaId)
            .orElseThrow(() -> new NotFoundException("Media not found."));

        boolean isAdmin = principal.role() == Role.ADMIN;

        // Owner-private kinds: only the owner (or admin) may download.
        if (asset.getKind() == MediaKind.PROFILE_IMAGE) {
            boolean isOwner = asset.getOwnerId() != null && asset.getOwnerId() == principal.userId();
            if (!isOwner && !isAdmin) {
                throw new NotFoundException("Media not found."); // do not reveal existence
            }
        }

        // Content availability: linked content must be visible to this caller.
        if (asset.getContentId() != null && !isAdmin) {
            ContentStatus status = contentRepository.findById(asset.getContentId())
                .map(item -> item.getStatus())
                .orElse(null);
            if (status != ContentStatus.PUBLISHED) {
                throw new NotFoundException("Media not found.");
            }
        }

        // Download permission (streaming stays independent of this flag).
        if (!asset.isDownloadable() && !isAdmin) {
            throw new ForbiddenException("This item is available for streaming only and cannot be downloaded.");
        }

        if (asset.getSecureUrl() == null || asset.getSecureUrl().isBlank()) {
            throw new StorageException("The stored file is currently unavailable.");
        }

        return new MediaDownloadDto(
            asset.getSecureUrl(),
            downloadFilename(asset),
            contentTypeFor(asset),
            asset.getBytes());
    }

    // --- validation helpers ------------------------------------------------

    /**
     * ADMIN: deletes a content image after validating asset ownership
     * (feature requirement: validate Cloudinary asset ownership before
     * deletion). The public id NEVER comes from the client - it is read from
     * our own {@code media_assets} row and must be inside the folder our
     * upload pipeline generated ({@code content/images/...}), so a tampered
     * row cannot destroy an arbitrary Cloudinary object.
     *
     * Idempotent: a missing asset row is a no-op.
     *
     * @param mediaAssetId asset to delete
     * @param contentId    content item that must own the asset
     */
    @Transactional
    public void deleteContentImage(long mediaAssetId, long contentId) {
        Optional<MediaAsset> found = media.findById(mediaAssetId);
        if (found.isEmpty()) {
            return; // already gone - deleting a step must stay idempotent
        }
        MediaAsset asset = found.get();
        boolean owned = asset.getKind() == MediaKind.CONTENT_IMAGE
            && asset.getContentId() != null
            && asset.getContentId() == contentId
            && asset.getPublicId() != null
            && asset.getPublicId().startsWith(folderFor(MediaKind.CONTENT_IMAGE) + "/");
        if (!owned) {
            // Never hand an unverified public id to the storage provider.
            throw new BadRequestException("This media asset does not belong to the given content item.");
        }
        storage.delete(asset.getPublicId(), resourceTypeFor(asset.getKind()));
        media.delete(asset);
    }

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
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (Exception ex) {
            throw new BadRequestException("Could not read the uploaded file.");
        }
        // Deep checks BEFORE bytes reach Cloudinary (quota protection).
        if (kind == MediaKind.PROFILE_IMAGE || kind == MediaKind.CONTENT_IMAGE) {
            validateImagePixels(bytes);
        }
        return bytes;
    }

    /**
     * Rejects images whose dimensions exceed the configured caps. A 50 MB phone
     * photo or a stitched panorama can be millions of pixels - Cloudinary bills
     * storage and transformations on the real payload, not just the byte count.
     * Uses ImageIO's header probe (no full decode) via a byte-array stream.
     */
    private void validateImagePixels(byte[] bytes) {
        int width;
        int height;
        try (ByteArrayInputStream in = new ByteArrayInputStream(bytes)) {
            var readers = ImageIO.getImageReaders(ImageIO.createImageInputStream(in));
            if (!readers.hasNext()) {
                throw new BadRequestException("The uploaded file is not a readable image.");
            }
            var reader = readers.next();
            try (var stream = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
                reader.setInput(stream, true, true);
                width = reader.getWidth(0);
                height = reader.getHeight(0);
            } finally {
                reader.dispose();
            }
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("The uploaded file is not a readable image.");
        }
        if (width <= 0 || height <= 0) {
            throw new BadRequestException("The uploaded file is not a readable image.");
        }
        int maxEdge = properties.maxImageDimension();
        if (width > maxEdge || height > maxEdge) {
            throw new BadRequestException("Image is too large: " + width + "x" + height
                + " px exceeds the " + maxEdge + " px edge limit.");
        }
        long pixels = (long) width * (long) height;
        if (pixels > properties.maxImagePixels()) {
            throw new BadRequestException("Image has too many pixels (" + pixels
                + "); the limit is " + properties.maxImagePixels() + ".");
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

    /** A safe, deterministic download filename; never trusts the stored path. */
    private static String downloadFilename(MediaAsset asset) {
        String name = asset.getOriginalName();
        if (name == null || name.isBlank()) {
            String ext = asset.getFormat() != null && !asset.getFormat().isBlank()
                ? "." + asset.getFormat() : "";
            name = asset.getKind().name().toLowerCase(Locale.ROOT) + "-" + asset.getId() + ext;
        }
        // Strip anything a client may have embedded; keep just the final segment.
        String base = name.replace('\\', '/');
        int slash = base.lastIndexOf('/');
        return slash >= 0 ? base.substring(slash + 1) : base;
    }

    /** Best-effort content type for the download response. */
    private static String contentTypeFor(MediaAsset asset) {
        String format = asset.getFormat() != null ? asset.getFormat().toLowerCase(Locale.ROOT) : "";
        return switch (asset.getKind()) {
            case PROFILE_IMAGE, CONTENT_IMAGE -> "image/" + (format.isBlank() ? "jpeg" : format);
            case VIDEO -> "video/" + (format.isBlank() ? "mp4" : format);
            case AUDIO -> switch (format) {
                case "mp3", "mpeg" -> "audio/mpeg";
                case "ogg" -> "audio/ogg";
                case "wav" -> "audio/wav";
                case "m4a", "mp4" -> "audio/mp4";
                default -> "application/octet-stream";
            };
        };
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
