package com.pranaveda.media;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import javax.imageio.ImageIO;

import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.ForbiddenException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.common.error.StorageException;
import com.pranaveda.common.error.UnauthorizedException;
import com.pranaveda.content.ContentItem;
import com.pranaveda.content.ContentRepository;
import com.pranaveda.content.ContentStatus;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.user.Role;
import com.pranaveda.user.User;
import com.pranaveda.user.UserRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Media service rules (agents.md 2.7 / 2.15): downloads require authentication,
 * content availability and the downloadable flag; uploads are validated
 * server-side before reaching storage; the acting user comes from the security
 * context - never from client-supplied IDs.
 */
class MediaServiceTest {

    private static final long USER_ID = 7L;
    private static final long ADMIN_ID = 42L;
    private static final long ASSET_ID = 11L;

    private StorageService storage;
    private MediaRepository media;
    private UserRepository users;
    private ContentRepository contentRepository;
    private MediaProperties properties;
    private MediaService service;

    @BeforeEach
    void setUp() {
        storage = mock(StorageService.class);
        media = mock(MediaRepository.class);
        users = mock(UserRepository.class);
        contentRepository = mock(ContentRepository.class);
        properties = new MediaProperties(
            5L * 1024 * 1024,
            100L * 1024 * 1024,
            50L * 1024 * 1024,
            4096,
            12_000_000L,
            3600,
            List.of("image/jpeg", "image/png", "image/webp"),
            List.of("video/mp4"),
            List.of("audio/mpeg", "audio/ogg"));
        service = new MediaService(storage, media, users, properties, contentRepository);

        when(media.findById(ASSET_ID)).thenReturn(Optional.of(asset(ASSET_ID, true)));
        when(media.save(any(MediaAsset.class))).thenAnswer(invocation -> {
            MediaAsset asset = invocation.getArgument(0);
            ReflectionTestUtils.setField(asset, "id", ASSET_ID);
            return asset;
        });
        when(storage.upload(any(), any(), any(), any()))
            .thenReturn(new StoredMedia("content/images/img-" + ASSET_ID,
                "https://res.cloudinary.com/x/content/images/img-" + ASSET_ID + ".jpg",
                "image", "jpg", 1024L, 800, 600, null));
        when(storage.upload(any(), any(), any(), any(), any()))
            .thenReturn(new StoredMedia("content/images/img-" + ASSET_ID,
                "https://res.cloudinary.com/x/content/images/img-" + ASSET_ID + ".jpg",
                "image", "jpg", 1024L, 800, 600, null));
        when(storage.uploadImage(any(), any(), any()))
            .thenReturn(new StoredMedia("profile/user-" + USER_ID + "/photo",
                "https://res.cloudinary.com/x/content/images/img-" + ASSET_ID + ".jpg",
                "image", "jpg", 1024L, 800, 600, null));

        authenticateAsUser();
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // --- download -----------------------------------------------------------

    @Test
    void downloadRequiresAuthentication() {
        SecurityContextHolder.clearContext();

        assertThat(catchThrowableOfType(() -> service.download(ASSET_ID), UnauthorizedException.class))
            .isNotNull();
    }

    @Test
    void downloadUnknownAssetReturnsNotFound() {
        when(media.findById(404L)).thenReturn(Optional.empty());

        assertThat(catchThrowableOfType(() -> service.download(404L), NotFoundException.class))
            .isNotNull();
    }

    @Test
    void downloadProfileImageNonOwnerDoesNotRevealExistence() {
        MediaAsset profile = asset(ASSET_ID, true);
        profile.setKind(MediaKind.PROFILE_IMAGE);
        profile.setOwnerId(99L);
        when(media.findById(ASSET_ID)).thenReturn(Optional.of(profile));

        assertThat(catchThrowableOfType(() -> service.download(ASSET_ID), NotFoundException.class))
            .isNotNull();
        verify(storage, never()).delete(any(), any());
    }

    @Test
    void downloadProfileImageOwnerSucceeds() {
        MediaAsset profile = asset(ASSET_ID, true);
        profile.setKind(MediaKind.PROFILE_IMAGE);
        profile.setOwnerId(USER_ID);
        profile.setDownloadable(true);
        when(media.findById(ASSET_ID)).thenReturn(Optional.of(profile));

        MediaDownloadDto dto = service.download(ASSET_ID);

        assertThat(dto.url()).isEqualTo(profile.getSecureUrl());
        assertThat(dto.filename()).isNotBlank();
    }

    @Test
    void downloadProfileImageAdminSucceeds() {
        MediaAsset profile = asset(ASSET_ID, true);
        profile.setKind(MediaKind.PROFILE_IMAGE);
        profile.setOwnerId(99L);
        profile.setDownloadable(true);
        when(media.findById(ASSET_ID)).thenReturn(Optional.of(profile));
        authenticateAsAdmin();

        MediaDownloadDto dto = service.download(ASSET_ID);

        assertThat(dto.url()).isEqualTo(profile.getSecureUrl());
    }

    @Test
    void downloadContentLinkedToDraftDeniedForMember() {
        MediaAsset contentImage = asset(ASSET_ID, true);
        contentImage.setKind(MediaKind.CONTENT_IMAGE);
        contentImage.setContentId(3L);
        when(media.findById(ASSET_ID)).thenReturn(Optional.of(contentImage));
        when(contentRepository.findById(3L))
            .thenReturn(Optional.of(contentItem(3L, ContentStatus.DRAFT)));

        assertThat(catchThrowableOfType(() -> service.download(ASSET_ID), NotFoundException.class))
            .isNotNull();
    }

    @Test
    void downloadContentLinkedToPublishedSucceedsForMember() {
        MediaAsset contentImage = asset(ASSET_ID, true);
        contentImage.setKind(MediaKind.CONTENT_IMAGE);
        contentImage.setContentId(3L);
        when(media.findById(ASSET_ID)).thenReturn(Optional.of(contentImage));
        when(contentRepository.findById(3L))
            .thenReturn(Optional.of(contentItem(3L, ContentStatus.PUBLISHED)));

        MediaDownloadDto dto = service.download(ASSET_ID);

        assertThat(dto.url()).isEqualTo(contentImage.getSecureUrl());
    }

    @Test
    void downloadNonDownloadableDeniedForMember() {
        MediaAsset asset = asset(ASSET_ID, false);
        asset.setDownloadable(false);
        when(media.findById(ASSET_ID)).thenReturn(Optional.of(asset));

        assertThat(catchThrowableOfType(() -> service.download(ASSET_ID), ForbiddenException.class))
            .isNotNull();
    }

    @Test
    void downloadNonDownloadableAllowedForAdmin() {
        MediaAsset asset = asset(ASSET_ID, false);
        asset.setDownloadable(false);
        when(media.findById(ASSET_ID)).thenReturn(Optional.of(asset));
        authenticateAsAdmin();

        MediaDownloadDto dto = service.download(ASSET_ID);

        assertThat(dto.url()).isEqualTo(asset.getSecureUrl());
    }

    @Test
    void downloadMissingSecureUrlThrowsStorageException() {
        MediaAsset asset = asset(ASSET_ID, true);
        asset.setSecureUrl(null);
        when(media.findById(ASSET_ID)).thenReturn(Optional.of(asset));

        assertThat(catchThrowableOfType(() -> service.download(ASSET_ID), StorageException.class))
            .isNotNull();
    }

    // --- admin upload -------------------------------------------------------

    @Test
    void uploadForAdminStoresAndPersistsMetadata() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "photo.png", "image/png",
            pngBytes(10, 10));
        when(contentRepository.existsById(3L)).thenReturn(true);

        MediaDto dto = service.uploadForAdmin(file, MediaKind.CONTENT_IMAGE, 3L, ADMIN_ID);

        assertThat(dto.kind()).isEqualTo(MediaKind.CONTENT_IMAGE);
        assertThat(dto.url()).startsWith("https://res.cloudinary.com/");
        verify(storage).upload(any(), eq("content/images"), any(), eq("image"), any());
        verify(media).save(any(MediaAsset.class));
    }

    @Test
    void uploadForAdminRejectsEmptyFile() {
        MockMultipartFile empty = new MockMultipartFile("file", "empty.png", "image/png", new byte[0]);

        assertThat(catchThrowableOfType(
            () -> service.uploadForAdmin(empty, MediaKind.CONTENT_IMAGE, null, ADMIN_ID),
            BadRequestException.class)).isNotNull();
    }

    @Test
    void uploadForAdminRejectsOversizedFile() {
        MockMultipartFile tooBig = new MockMultipartFile("file", "big.png", "image/png",
            new byte[(int) properties.maxImageBytes() + 1]);

        assertThat(catchThrowableOfType(
            () -> service.uploadForAdmin(tooBig, MediaKind.CONTENT_IMAGE, null, ADMIN_ID),
            BadRequestException.class)).isNotNull();
    }

    @Test
    void uploadForAdminRejectsUnsupportedContentType() {
        MockMultipartFile wrong = new MockMultipartFile("file", "song.txt", "text/plain",
            "not an image".getBytes());

        assertThat(catchThrowableOfType(
            () -> service.uploadForAdmin(wrong, MediaKind.CONTENT_IMAGE, null, ADMIN_ID),
            BadRequestException.class)).isNotNull();
    }

    @Test
    void uploadForAdminRejectsUnreadableImage() {
        MockMultipartFile garbage = new MockMultipartFile("file", "garbage.jpg", "image/jpeg",
            "not really a jpeg".getBytes());

        assertThat(catchThrowableOfType(
            () -> service.uploadForAdmin(garbage, MediaKind.CONTENT_IMAGE, null, ADMIN_ID),
            BadRequestException.class)).isNotNull();
    }

    @Test
    void uploadForAdminRejectsProfileImageKind() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "photo.png", "image/png",
            pngBytes(10, 10));

        assertThat(catchThrowableOfType(
            () -> service.uploadForAdmin(file, MediaKind.PROFILE_IMAGE, null, ADMIN_ID),
            BadRequestException.class))
            .hasMessageContaining("/me/profile-photo");
    }

    @Test
    void uploadForAdminRejectsUnknownContentId() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "photo.png", "image/png",
            pngBytes(10, 10));
        when(contentRepository.existsById(999L)).thenReturn(false);

        assertThat(catchThrowableOfType(
            () -> service.uploadForAdmin(file, MediaKind.CONTENT_IMAGE, 999L, ADMIN_ID),
            BadRequestException.class))
            .hasMessageContaining("No content item exists");
    }

    // --- profile photo ------------------------------------------------------

    @Test
    void setProfilePhotoRequiresAuthentication() throws Exception {
        SecurityContextHolder.clearContext();

        MockMultipartFile file = new MockMultipartFile("file", "photo.png", "image/png",
            pngBytes(10, 10));

        assertThat(catchThrowableOfType(() -> service.setProfilePhoto(file), UnauthorizedException.class))
            .isNotNull();
    }

    @Test
    void setProfilePhotoUserNotFound() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "photo.png", "image/png",
            pngBytes(10, 10));
        when(users.findById(USER_ID)).thenReturn(Optional.empty());

        assertThat(catchThrowableOfType(() -> service.setProfilePhoto(file), NotFoundException.class))
            .isNotNull();
    }

    @Test
    void setProfilePhotoStoresAndUpdatesUser() throws Exception {
        User user = user(USER_ID);
        when(users.findById(USER_ID)).thenReturn(Optional.of(user));
        MockMultipartFile file = new MockMultipartFile("file", "photo.png", "image/png",
            pngBytes(10, 10));

        service.setProfilePhoto(file);

        verify(storage).uploadImage(any(), eq("profile"), any());
        verify(users).save(user);
        assertThat(user.getProfileImageUrl()).isEqualTo(
            "https://res.cloudinary.com/x/content/images/img-" + ASSET_ID + ".jpg");
    }

    @Test
    void clearProfilePhotoDeletesStoredObjectAndClearsUser() {
        User user = user(USER_ID);
        user.setProfileImagePublicId("profile/user-7/photo");
        user.setProfileImageUrl("https://res.cloudinary.com/x/profile/user-7/photo.jpg");
        when(users.findById(USER_ID)).thenReturn(Optional.of(user));

        service.clearProfilePhoto();

        verify(storage).delete("profile/user-7/photo", "image");
        verify(users).save(user);
        assertThat(user.getProfileImageUrl()).isNull();
        assertThat(user.getProfileImagePublicId()).isNull();
    }

    // --- content image cleanup ---------------------------------------------

    @Test
    void deleteContentImageRejectsAssetOwnedByOtherContent() {
        MediaAsset asset = asset(ASSET_ID, true);
        asset.setContentId(3L);
        when(media.findById(ASSET_ID)).thenReturn(Optional.of(asset));

        assertThat(catchThrowableOfType(
            () -> service.deleteContentImage(ASSET_ID, 42L), BadRequestException.class))
            .isNotNull();
        verify(storage, never()).delete(any(), any());
        verify(media, never()).delete(any());
    }

    @Test
    void deleteContentImageIsIdempotentWhenAssetMissing() {
        when(media.findById(ASSET_ID)).thenReturn(Optional.empty());

        service.deleteContentImage(ASSET_ID, 3L);

        verify(storage, never()).delete(any(), any());
        verify(media, never()).delete(any());
    }

    // --- helpers ------------------------------------------------------------

    private static MediaAsset asset(long id, boolean downloadable) {
        MediaAsset asset = new MediaAsset();
        ReflectionTestUtils.setField(asset, "id", id);
        asset.setKind(MediaKind.CONTENT_IMAGE);
        asset.setSecureUrl("https://res.cloudinary.com/x/content/images/img-" + id + ".jpg");
        asset.setFormat("jpg");
        asset.setBytes(1024L);
        asset.setDownloadable(downloadable);
        return asset;
    }

    private static ContentItem contentItem(long id, ContentStatus status) {
        ContentItem item = new ContentItem();
        ReflectionTestUtils.setField(item, "id", id);
        item.setSlug("item-" + id);
        item.setTitle("Item " + id);
        item.setContentType(com.pranaveda.content.ContentType.ASANA);
        item.setStatus(status);
        return item;
    }

    private static User user(long id) {
        User user = new User();
        ReflectionTestUtils.setField(user, "id", id);
        user.setEmail("user" + id + "@pranaveda.dev");
        user.setPasswordHash("hash");
        user.setDisplayName("User " + id);
        user.setRole(Role.USER);
        return user;
    }

    private static byte[] pngBytes(int width, int height) throws Exception {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return out.toByteArray();
    }

    private static void authenticateAsUser() {
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                new CurrentUserPrincipal(USER_ID, "user@pranaveda.dev", Role.USER),
                null,
                List.of(() -> "ROLE_USER")));
    }

    private static void authenticateAsAdmin() {
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                new CurrentUserPrincipal(ADMIN_ID, "admin@pranaveda.dev", Role.ADMIN),
                null,
                List.of(() -> "ROLE_ADMIN")));
    }
}