package com.pranaveda.content;

import java.util.List;

import jakarta.validation.constraints.Size;

/**
 * Edit payload for one step. A {@code null} field leaves the value unchanged;
 * a blank string clears it. When the instruction changes, its source is reset
 * to {@link InstructionSource#ADMIN} (an admin edit always supersedes a draft).
 */
public record AdminStepUpdateRequest(
    @Size(max = 300) String caption,
    @Size(max = 2000) String instruction,
    StepMediaType mediaType,
    String coverImageUrl,
    String imageUrl,
    List<String> imageUrls,
    String videoUrl,
    String audioUrl) {

    public AdminStepUpdateRequest {
        caption = caption == null ? null : caption.trim();
        instruction = instruction == null ? null : instruction.trim();
        coverImageUrl = coverImageUrl == null ? null : coverImageUrl.trim();
        imageUrl = imageUrl == null ? null : imageUrl.trim();
        videoUrl = videoUrl == null ? null : videoUrl.trim();
        audioUrl = audioUrl == null ? null : audioUrl.trim();
        imageUrls = imageUrls == null ? List.of() : imageUrls;
    }
}
