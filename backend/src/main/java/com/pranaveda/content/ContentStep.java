package com.pranaveda.content;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;

/**
 * One ordered step of a guided pose tutorial (feature: guided yoga pose with
 * voice narration). Each step carries exactly one media type plus its own
 * separate cover image. Media is served via Cloudinary delivery URLs.
 *
 * <p>Schema is Hibernate-owned from this mapping (application.properties
 * {@code spring.jpa.hibernate.ddl-auto=update}); no migration tool is used in
 * this repository.
 */
@Entity
@Table(name = "content_steps",
    uniqueConstraints = @UniqueConstraint(name = "uq_content_steps_media", columnNames = "media_asset_id"),
    indexes = {
        @Index(name = "ix_content_steps_content_order", columnList = "content_id, step_order"),
        @Index(name = "ix_content_steps_content", columnList = "content_id")})
@Checks({
    @Check(constraints = "step_order >= 0"),
    @Check(constraints = "media_type IS NULL OR media_type IN ('IMAGE', 'VIDEO', 'AUDIO')"),
    @Check(constraints = "instruction_source IS NULL OR instruction_source IN ('AI', 'ADMIN')")})
public class ContentStep {

    /** Upper bound per content item - keeps AI generation and UI paging sane. */
    public static final int MAX_STEPS = 20;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    /** Zero-based display order; always normalized 0..n-1 by the service. */
    @Column(name = "step_order", nullable = false)
    private int stepOrder;

    /** Which media kind this step plays. */
    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", length = 16)
    private StepMediaType mediaType;

    /** Separate cover image for this step (Cloudinary delivery URL). */
    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    /** IMAGE: primary image URL (or first image of a slideshow). */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /** IMAGE: all image URLs for the step slideshow (Cloudinary URLs). */
    @ElementCollection
    @jakarta.persistence.CollectionTable(name = "content_step_images", joinColumns = @JoinColumn(name = "step_id"))
    @Column(name = "image_url", length = 500)
    private List<String> imageUrls = new ArrayList<>();

    /** VIDEO: Cloudinary delivery URL. */
    @Column(name = "video_url", length = 500)
    private String videoUrl;

    /** AUDIO: Cloudinary delivery URL. */
    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    /** Generated Cloudinary public id (never client-supplied); used for deletion. */
    @Column(name = "image_public_id", length = 255)
    private String imagePublicId;

    @Column(name = "media_asset_id")
    private Long mediaAssetId;

    @Column(name = "caption", length = 300)
    private String caption;

    /** Narration script read aloud by the browser's speech synthesis. */
    @Column(name = "instruction", length = 2000)
    private String instruction;

    @Enumerated(EnumType.STRING)
    @Column(name = "instruction_source", length = 16)
    private InstructionSource instructionSource;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // --- getters / setters -------------------------------------------------

    public Long getId() {
        return id;
    }

    public Long getContentId() {
        return contentId;
    }

    public void setContentId(Long contentId) {
        this.contentId = contentId;
    }

    public int getStepOrder() {
        return stepOrder;
    }

    public void setStepOrder(int stepOrder) {
        this.stepOrder = stepOrder;
    }

    public StepMediaType getMediaType() {
        return mediaType;
    }

    public void setMediaType(StepMediaType mediaType) {
        this.mediaType = mediaType;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls != null ? imageUrls : new ArrayList<>();
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public String getImagePublicId() {
        return imagePublicId;
    }

    public void setImagePublicId(String imagePublicId) {
        this.imagePublicId = imagePublicId;
    }

    public Long getMediaAssetId() {
        return mediaAssetId;
    }

    public void setMediaAssetId(Long mediaAssetId) {
        this.mediaAssetId = mediaAssetId;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public String getInstruction() {
        return instruction;
    }

    public void setInstruction(String instruction) {
        this.instruction = instruction;
    }

    public InstructionSource getInstructionSource() {
        return instructionSource;
    }

    public void setInstructionSource(InstructionSource instructionSource) {
        this.instructionSource = instructionSource;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
