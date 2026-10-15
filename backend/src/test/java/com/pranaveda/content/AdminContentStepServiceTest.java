package com.pranaveda.content;

import java.util.List;
import java.util.Optional;

import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.common.error.UnauthorizedException;
import com.pranaveda.media.MediaAsset;
import com.pranaveda.media.MediaDto;
import com.pranaveda.media.MediaKind;
import com.pranaveda.media.MediaRepository;
import com.pranaveda.media.MediaService;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.user.Role;

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
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Guided-step admin rules: ordering is normalized, ownership of the linked
 * media is re-validated on delete, AI drafts fill only empty instructions, and
 * the acting editor comes from the security context.
 */
class AdminContentStepServiceTest {

    private static final long ADMIN_ID = 42L;
    private static final long CONTENT_ID = 7L;

    private ContentRepository contentRepository;
    private ContentStepRepository stepRepository;
    private MediaRepository mediaRepository;
    private MediaService mediaService;
    private StepInstructionGenerator generator;
    private AdminContentStepService service;

    @BeforeEach
    void setUp() {
        contentRepository = mock(ContentRepository.class);
        stepRepository = mock(ContentStepRepository.class);
        mediaRepository = mock(MediaRepository.class);
        mediaService = mock(MediaService.class);
        generator = mock(StepInstructionGenerator.class);
        service = new AdminContentStepService(contentRepository, stepRepository,
            mediaRepository, mediaService, generator);

        authenticateAsAdmin();
        when(contentRepository.findById(CONTENT_ID)).thenReturn(Optional.of(content(CONTENT_ID)));
        when(stepRepository.findByContentIdOrderByStepOrderAsc(CONTENT_ID)).thenReturn(List.of());
        when(stepRepository.countByContentId(CONTENT_ID)).thenReturn(0L);
        when(stepRepository.save(any(ContentStep.class))).thenAnswer(inv -> {
            ContentStep step = inv.getArgument(0);
            ReflectionTestUtils.setField(step, "id", 1L);
            return step;
        });
        when(stepRepository.saveAll(any(List.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void addStepStoresCloudinaryMetadataAndAppendsInOrder() {
        MediaDto uploaded = new MediaDto(11L, MediaKind.CONTENT_IMAGE,
            "https://res.cloudinary.com/x/content/images/a.jpg", "jpg", 1024L, 800, 600, null);
        when(mediaService.uploadForAdmin(any(), eq(MediaKind.CONTENT_IMAGE), eq(CONTENT_ID), eq(ADMIN_ID)))
            .thenReturn(uploaded);
        when(mediaRepository.findById(11L)).thenReturn(Optional.of(asset(11L, CONTENT_ID)));

        ContentStepDto dto = service.addStep(CONTENT_ID,
            new MockMultipartFile("file", "pose.jpg", "image/jpeg", "bytes".getBytes()),
            " Stand tall ", "Breathe in.");

        assertThat(dto.stepOrder()).isZero();
        assertThat(dto.imageUrl()).isEqualTo("https://res.cloudinary.com/x/content/images/a.jpg");
        assertThat(dto.caption()).isEqualTo("Stand tall");
        assertThat(dto.instruction()).isEqualTo("Breathe in.");
        assertThat(dto.instructionSource()).isEqualTo(InstructionSource.ADMIN);
    }

    @Test
    void addStepRejectsMissingFileBeforeAnyUpload() {
        BadRequestException ex = catchThrowableOfType(
            () -> service.addStep(CONTENT_ID, null, null, null), BadRequestException.class);

        assertThat(ex.getMessage()).contains("image file");
        verify(mediaService, never()).uploadForAdmin(any(), any(), anyLong(), anyLong());
    }

    @Test
    void addStepFailsClosedWhenUnauthenticated() {
        SecurityContextHolder.clearContext();

        catchThrowableOfType(() -> service.addStep(CONTENT_ID,
            new MockMultipartFile("file", "pose.jpg", "image/jpeg", "bytes".getBytes()), null, null),
            UnauthorizedException.class);
    }

    @Test
    void reorderRenumbersTheRequestedOrderAndRejectsForeignIds() {
        ContentStep first = step(1L, 0);
        ContentStep second = step(2L, 1);
        when(stepRepository.findByContentIdOrderByStepOrderAsc(CONTENT_ID)).thenReturn(List.of(first, second));

        List<ContentStepDto> reordered = service.reorder(CONTENT_ID, new AdminStepReorderRequest(List.of(2L, 1L)));

        assertThat(reordered).extracting(ContentStepDto::id).containsExactly(2L, 1L);
        assertThat(second.getStepOrder()).isZero();
        assertThat(first.getStepOrder()).isEqualTo(1);

        BadRequestException ex = catchThrowableOfType(
            () -> service.reorder(CONTENT_ID, new AdminStepReorderRequest(List.of(2L, 99L))),
            BadRequestException.class);
        assertThat(ex.getMessage()).contains("unknown step ids");
    }

    @Test
    void deleteRemovesStepAndDelegatesValidatedMediaDeletion() {
        ContentStep step = step(5L, 0);
        step.setMediaAssetId(11L);
        when(stepRepository.existsByIdAndContentId(5L, CONTENT_ID)).thenReturn(true);
        when(stepRepository.findById(5L)).thenReturn(Optional.of(step));

        service.delete(CONTENT_ID, 5L);

        verify(stepRepository).delete(step);
        verify(mediaService).deleteContentImage(11L, CONTENT_ID);
    }

    @Test
    void deleteOfUnknownStepReturnsNotFoundAndTouchesNoMedia() {
        when(stepRepository.existsByIdAndContentId(404L, CONTENT_ID)).thenReturn(false);

        catchThrowableOfType(() -> service.delete(CONTENT_ID, 404L), NotFoundException.class);

        verify(mediaService, never()).deleteContentImage(anyLong(), anyLong());
    }

    @Test
    void generateFillsOnlyEmptyInstructionsUnlessOverwriteRequested() {
        ContentStep empty = step(1L, 0);
        ContentStep filled = step(2L, 1);
        filled.setInstruction("Keep the original.");
        filled.setInstructionSource(InstructionSource.ADMIN);
        when(stepRepository.findByContentIdOrderByStepOrderAsc(CONTENT_ID)).thenReturn(List.of(empty, filled));
        when(generator.generate(any(), any(), anyInt(), anyInt())).thenReturn("Generated narration.");

        List<ContentStepDto> result = service.generateInstructions(CONTENT_ID,
            new AdminGenerateInstructionsRequest(null, false));

        assertThat(result.get(0).instruction()).isEqualTo("Generated narration.");
        assertThat(result.get(0).instructionSource()).isEqualTo(InstructionSource.AI);
        assertThat(result.get(1).instruction()).isEqualTo("Keep the original.");

        service.generateInstructions(CONTENT_ID, new AdminGenerateInstructionsRequest(List.of(2L), true));
        assertThat(filled.getInstruction()).isEqualTo("Generated narration.");
    }

    @Test
    void generateWithoutStepsIsRejected() {
        catchThrowableOfType(() -> service.generateInstructions(CONTENT_ID,
            new AdminGenerateInstructionsRequest(null, false)), BadRequestException.class);

        verify(generator, never()).generate(any(), any(), anyInt(), anyInt());
    }

    // --- helpers -----------------------------------------------------------

    private static ContentItem content(long id) {
        ContentItem item = new ContentItem();
        item.setSlug("tree-pose");
        item.setTitle("Tree Pose");
        item.setContentType(ContentType.ASANA);
        ReflectionTestUtils.setField(item, "id", id);
        return item;
    }

    private static ContentStep step(long id, int order) {
        ContentStep step = new ContentStep();
        step.setContentId(CONTENT_ID);
        step.setStepOrder(order);
        step.setImageUrl("https://res.cloudinary.com/x/content/images/s.jpg");
        step.setImagePublicId("content/images/content_image-" + id);
        ReflectionTestUtils.setField(step, "id", id);
        return step;
    }

    private static MediaAsset asset(long id, long contentId) {
        MediaAsset asset = new MediaAsset();
        ReflectionTestUtils.setField(asset, "id", id);
        asset.setKind(MediaKind.CONTENT_IMAGE);
        asset.setContentId(contentId);
        asset.setPublicId("content/images/content_image-" + id);
        asset.setSecureUrl("https://res.cloudinary.com/x/content/images/a.jpg");
        return asset;
    }

    private static void authenticateAsAdmin() {
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                new CurrentUserPrincipal(ADMIN_ID, "admin@pranaveda.dev", Role.ADMIN),
                null,
                List.of(() -> "ROLE_ADMIN")));
    }
}
