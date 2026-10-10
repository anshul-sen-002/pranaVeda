package com.pranaveda.media;

import com.pranaveda.security.CurrentUserPrincipal;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.tags.Tag;

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

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
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
}
