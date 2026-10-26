package com.pranaveda.content;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.media.MediaAsset;
import com.pranaveda.media.MediaDto;
import com.pranaveda.media.MediaKind;
import com.pranaveda.media.MediaRepository;
import com.pranaveda.media.MediaService;
import com.pranaveda.security.CurrentUserPrincipal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Admin workflow for guided pose steps (feature: guided yoga pose with voice
 * narration): ordered Cloudinary images plus editable narration text.
 *
 * <p>Security rules honored here:
 * - Route is under {@code /api/v1/admin/**} (ADMIN-only) and the acting editor
 *   id comes from the security context, never from the request.
 * - Image bytes go through the existing {@link MediaService} upload pipeline
 *   (MIME/size validation, generated public ids, credentials stay server-side).
 * - Deletion re-validates that the asset is a CONTENT_IMAGE owned by this
 *   content item before any Cloudinary destroy call (agents.md 2.15).
 * - Narration is text only; no audio is generated or stored.
 */
@Service
public class AdminContentStepService {

    private final ContentRepository contentRepository;
    private final ContentStepRepository stepRepository;
    private final MediaRepository mediaRepository;
    private final MediaService mediaService;
    private final StepInstructionGenerator generator;

    public AdminContentStepService(ContentRepository contentRepository,
                                   ContentStepRepository stepRepository,
                                   MediaRepository mediaRepository,
                                   MediaService mediaService,
                                   StepInstructionGenerator generator) {
        this.contentRepository = contentRepository;
        this.stepRepository = stepRepository;
        this.mediaRepository = mediaRepository;
        this.mediaService = mediaService;
        this.generator = generator;
    }

    @Transactional(readOnly = true)
    public List<ContentStepDto> list(long contentId) {
        requireContent(contentId);
        return toDtos(stepRepository.findByContentIdOrderByStepOrderAsc(contentId));
    }

    /** Uploads the image through the secure Cloudinary flow and appends a step. */
    @Transactional
    public ContentStepDto addStep(long contentId, MultipartFile file, String caption, String instruction) {
        requireContent(contentId);
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("An image file is required.");
        }
        if (stepRepository.countByContentId(contentId) >= ContentStep.MAX_STEPS) {
            throw new BadRequestException("A pose can have at most " + ContentStep.MAX_STEPS + " guided steps.");
        }
        String safeCaption = checkedCaption(caption);
        String safeInstruction = checkedInstruction(instruction);

        long editor = CurrentUserPrincipal.requireCurrentUserId();
        MediaDto uploaded = mediaService.uploadForAdmin(file, MediaKind.CONTENT_IMAGE, contentId, editor);
        MediaAsset asset = mediaRepository.findById(uploaded.id())
            .orElseThrow(() -> new NotFoundException("Uploaded media asset not found."));

        ContentStep step = new ContentStep();
        step.setContentId(contentId);
        step.setStepOrder((int) stepRepository.countByContentId(contentId));
        step.setImageUrl(asset.getSecureUrl());
        step.setImagePublicId(asset.getPublicId());
        step.setMediaAssetId(asset.getId());
        step.setCaption(safeCaption);
        step.setInstruction(safeInstruction);
        step.setInstructionSource(safeInstruction == null ? null : InstructionSource.ADMIN);
        step.setMediaType(StepMediaType.IMAGE);
        return ContentStepDto.from(stepRepository.save(step));
    }

    /** Renumbers steps 0..n-1 in the requested order. Validates the whole list. */
    @Transactional
    public List<ContentStepDto> reorder(long contentId, AdminStepReorderRequest request) {
        requireContent(contentId);
        List<ContentStep> current = stepRepository.findByContentIdOrderByStepOrderAsc(contentId);
        List<Long> requested = request.stepIds() == null ? List.of() : request.stepIds();

        if (requested.isEmpty() || requested.size() != current.size()) {
            throw new BadRequestException("The reorder list must contain every step exactly once.");
        }
        Set<Long> unique = new LinkedHashSet<>(requested);
        if (unique.size() != requested.size()) {
            throw new BadRequestException("The reorder list contains duplicate step ids.");
        }
        List<Long> existingIds = current.stream().map(ContentStep::getId).toList();
        if (!unique.containsAll(existingIds)) {
            throw new BadRequestException("The reorder list contains unknown step ids.");
        }

        Map<Long, ContentStep> byId = current.stream()
            .collect(Collectors.toMap(ContentStep::getId, s -> s, (a, b) -> a));
        List<ContentStep> renumbered = new ArrayList<>(requested.size());
        for (int i = 0; i < requested.size(); i++) {
            ContentStep step = byId.get(requested.get(i));
            step.setStepOrder(i);
            renumbered.add(step);
        }
        return toDtos(stepRepository.saveAll(renumbered));
    }

    /**
     * Fills narration text via the OpenRouter Agent API for the selected steps
     * (all steps when {@code stepIds} is empty). Existing text is only replaced
     * when {@code overwrite=true}; the admin reviews every result before
     * publishing.
     */
    @Transactional
    public List<ContentStepDto> generateInstructions(long contentId, AdminGenerateInstructionsRequest request) {
        ContentItem item = requireContent(contentId);
        List<ContentStep> steps = stepRepository.findByContentIdOrderByStepOrderAsc(contentId);
        if (steps.isEmpty()) {
            throw new BadRequestException("Add at least one image step before generating instructions.");
        }

        Set<Long> selected = selectSteps(steps, request);
        int total = steps.size();
        for (int i = 0; i < steps.size(); i++) {
            ContentStep step = steps.get(i);
            if (!selected.contains(step.getId())) {
                continue;
            }
            boolean hasText = step.getInstruction() != null && !step.getInstruction().isBlank();
            if (hasText && !request.overwrite()) {
                continue;
            }
            step.setInstruction(generator.generate(item, step, i + 1, total));
            step.setInstructionSource(InstructionSource.AI);
        }
        return toDtos(stepRepository.saveAll(steps));
    }

    /** Updates an existing step's media and narration fields. */
    @Transactional
    public ContentStepDto update(long contentId, long stepId, AdminStepUpdateRequest request) {
        ContentStep step = requireStep(contentId, stepId);
        if (request.mediaType() != null) step.setMediaType(request.mediaType());
        if (request.coverImageUrl() != null) step.setCoverImageUrl(request.coverImageUrl());
        if (request.imageUrl() != null) step.setImageUrl(request.imageUrl());
        if (request.videoUrl() != null) step.setVideoUrl(request.videoUrl());
        if (request.audioUrl() != null) step.setAudioUrl(request.audioUrl());
        step.setImageUrls(request.imageUrls());
        if (request.caption() != null) step.setCaption(request.caption());
        if (request.instruction() != null) {
            step.setInstruction(request.instruction());
            step.setInstructionSource(InstructionSource.ADMIN);
        }
        return ContentStepDto.from(stepRepository.save(step));
    }

    /** Deletes the step, then its Cloudinary image after ownership validation. */
    @Transactional
    public void delete(long contentId, long stepId) {
        ContentStep step = requireStep(contentId, stepId);
        stepRepository.delete(step);
        if (step.getMediaAssetId() != null) {
            // Validates CONTENT_IMAGE kind + content ownership before destroy.
            mediaService.deleteContentImage(step.getMediaAssetId(), contentId);
        }
    }

    // --- helpers -----------------------------------------------------------

    private Set<Long> selectSteps(List<ContentStep> steps, AdminGenerateInstructionsRequest request) {
        List<Long> requested = request.stepIds() == null ? List.of() : request.stepIds();
        if (requested.isEmpty()) {
            return new LinkedHashSet<>(steps.stream().map(ContentStep::getId).toList());
        }
        Set<Long> existing = steps.stream().map(ContentStep::getId).collect(Collectors.toSet());
        Set<Long> unique = new LinkedHashSet<>(requested);
        if (!existing.containsAll(unique)) {
            throw new BadRequestException("The request contains unknown step ids.");
        }
        return unique;
    }

    private ContentItem requireContent(long contentId) {
        return contentRepository.findById(contentId)
            .orElseThrow(() -> new NotFoundException("Content not found."));
    }

    private ContentStep requireStep(long contentId, long stepId) {
        if (!stepRepository.existsByIdAndContentId(stepId, contentId)) {
            throw new NotFoundException("Step not found.");
        }
        return stepRepository.findById(stepId)
            .orElseThrow(() -> new NotFoundException("Step not found."));
    }

    private static String checkedCaption(String caption) {
        String value = trimToNull(caption);
        if (value != null && value.length() > 300) {
            throw new BadRequestException("Caption must be at most 300 characters.");
        }
        return value;
    }

    private static String checkedInstruction(String instruction) {
        String value = trimToNull(instruction);
        if (value != null && value.length() > 2000) {
            throw new BadRequestException("Instruction must be at most 2000 characters.");
        }
        return value;
    }

    private static List<ContentStepDto> toDtos(List<ContentStep> steps) {
        return steps.stream().map(ContentStepDto::from).toList();
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
