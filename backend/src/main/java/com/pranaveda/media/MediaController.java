package com.pranaveda.media;

import com.pranaveda.media.LocalStorageService;
import com.pranaveda.security.CurrentUserPrincipal;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.tags.Tag;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Media upload endpoints (agents.md 2.15, 2.7). Admin uploads are covered by
 * the {@code /api/v1/admin/**} role rule; profile photos live under
 * {@code /api/v1/me/**} and are resolved from the security context.
 */
@Tag(name = "Media")
@RestController
@RequestMapping("/api/v1")
public class MediaController {

    private final MediaService mediaService;
    private final ObjectProvider<LocalStorageService> localStorage;

    public MediaController(MediaService mediaService,
                           ObjectProvider<LocalStorageService> localStorage) {
        this.mediaService = mediaService;
        this.localStorage = localStorage;
    }

    /** ADMIN: stores an uploaded asset and returns its safe metadata. */
    @PostMapping(value = "/admin/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MediaDto> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("kind") MediaKind kind,
            @RequestParam(required = false) Long contentId) {
        long adminId = CurrentUserPrincipal.requireCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(mediaService.uploadForAdmin(file, kind, contentId, adminId));
    }

    /**
     * ADMIN: deletes an uploaded asset from both Cloudinary and the database
     * (agents.md 2.15 cleanup). Profile photos are rejected here - they are
     * owner-managed through {@code /me/profile-photo}. The route is covered by
     * the {@code /api/v1/admin/** -> hasRole("ADMIN")} rule, so a member can
     * never reach it.
     */
    @DeleteMapping("/admin/media/{id}")
    public ResponseEntity<Void> deleteAdminMedia(@PathVariable long id) {
        mediaService.deleteAdminAsset(id);
        return ResponseEntity.noContent().build();
    }

    /** Signed-in user: replaces their profile photo. */
    @PostMapping(value = "/me/profile-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProfilePhotoDto setProfilePhoto(@RequestParam("file") MultipartFile file) {
        return mediaService.setProfilePhoto(file);
    }

    /** Signed-in user: current profile photo URL (empty body fields when unset). */
    @GetMapping("/me/profile-photo")
    public ResponseEntity<ProfilePhotoDto> getProfilePhoto() {
        return mediaService.currentProfilePhotoUrl()
            .map(ProfilePhotoDto::new)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Signed-in user: removes their profile photo. Idempotent. */
    @DeleteMapping("/me/profile-photo")
    public ResponseEntity<Void> clearProfilePhoto() {
        mediaService.clearProfilePhoto();
        return ResponseEntity.noContent().build();
    }

    /**
     * Signed-in user: authorized download descriptor for an asset (agents.md
     * 2.7). Route is under {@code /me/**} (authenticated); the service re-checks
     * ownership, content availability, and the downloadable flag.
     */
    @GetMapping("/me/media/{id}/download")
    public MediaDownloadDto download(@PathVariable long id) {
        return mediaService.download(id);
    }

    /**
     * Serve locally stored media files (only when {@code app.storage.provider=local}).
     * Public read access - no auth required, since the public URL is returned
     * in {@link MediaDto} and used for cover art / stream previews.
     */
    @GetMapping("/media/serve/{publicId:.+}")
    public ResponseEntity<byte[]> serveLocal(@PathVariable String publicId) {
        LocalStorageService storage = localStorage.getIfAvailable();
        if (storage == null) {
            return ResponseEntity.notFound().build();
        }
        Path path = storage.resolvePath(publicId).normalize();
        // Prevent path traversal: the resolved path must stay under the root.
        if (!path.startsWith(storage.getRoot())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (!Files.isRegularFile(path)) {
            return ResponseEntity.notFound().build();
        }
        try {
            byte[] data = Files.readAllBytes(path);
            String format = LocalStorageService.guessFormatFromBytes(data);
            MediaType contentType = switch (format != null ? format : "bin") {
                case "png" -> MediaType.IMAGE_PNG;
                case "jpeg", "jpg" -> MediaType.IMAGE_JPEG;
                case "gif" -> MediaType.IMAGE_GIF;
                case "webp" -> MediaType.parseMediaType("image/webp");
                case "avif" -> MediaType.parseMediaType("image/avif");
                case "mp3", "mpeg" -> MediaType.parseMediaType("audio/mpeg");
                case "ogg" -> MediaType.parseMediaType("audio/ogg");
                case "wav" -> MediaType.parseMediaType("audio/wav");
                case "m4a" -> MediaType.parseMediaType("audio/mp4");
                case "mp4", "webm", "mov" -> MediaType.parseMediaType("video/" + format);
                default -> MediaType.APPLICATION_OCTET_STREAM;
            };
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(contentType);
            headers.setContentLength(data.length);
            headers.setCacheControl("public, max-age=86400");
            return ResponseEntity.ok().headers(headers).body(data);
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
