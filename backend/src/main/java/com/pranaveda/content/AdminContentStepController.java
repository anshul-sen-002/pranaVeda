package com.pranaveda.content;

import java.util.List;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Admin endpoints for guided pose steps (feature: guided yoga pose with voice
 * narration). All routes live under {@code /api/v1/admin/content/**} which the
 * security chain restricts to {@code hasRole("ADMIN")}; editor identity is
 * resolved from the security context inside the service.
 */
@Tag(name = "Admin guided steps")
@RestController
@RequestMapping("/api/v1/admin/content/{contentId}/steps")
public class AdminContentStepController {

    private final AdminContentStepService service;

    public AdminContentStepController(AdminContentStepService service) {
        this.service = service;
    }

    @GetMapping
    public List<ContentStepDto> list(@PathVariable long contentId) {
        return service.list(contentId);
    }

    /** Multipart upload: image through the secure Cloudinary flow + step row. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContentStepDto> add(
            @PathVariable long contentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String caption,
            @RequestParam(required = false) String instruction) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.addStep(contentId, file, caption, instruction));
    }

    @PutMapping("/{stepId}")
    public ContentStepDto update(
            @PathVariable long contentId,
            @PathVariable long stepId,
            @Valid @RequestBody AdminStepUpdateRequest request) {
        return service.update(contentId, stepId, request);
    }

    @PutMapping("/reorder")
    public List<ContentStepDto> reorder(
            @PathVariable long contentId,
            @Valid @RequestBody AdminStepReorderRequest request) {
        return service.reorder(contentId, request);
    }

    /** Generates narration drafts through the OpenRouter Agent API for admin review. */
    @PostMapping("/generate-instructions")
    public List<ContentStepDto> generate(
            @PathVariable long contentId,
            @RequestBody(required = false) AdminGenerateInstructionsRequest request) {
        return service.generateInstructions(contentId,
            request != null ? request : new AdminGenerateInstructionsRequest(null, false));
    }

    @DeleteMapping("/{stepId}")
    public ResponseEntity<Void> delete(@PathVariable long contentId, @PathVariable long stepId) {
        service.delete(contentId, stepId);
        return ResponseEntity.noContent().build();
    }
}
