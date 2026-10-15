package com.pranaveda.content;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;

/**
 * One ordered image + narration step of a guided pose (feature: guided yoga
 * pose with voice narration). Mirrors the {@code content_item_facets} pattern:
 * a child row keyed by {@code content_id}, never a client-supplied target.
 *
 * <p>The image itself lives in Cloudinary; only its delivery URL and generated
 * public id are stored here ({@code media_asset_id} links back to
 * {@code media_assets} for lifecycle/ownership). The narration {@code
 * instruction} is plain text read aloud by the browser - no audio files are
 * ever generated or stored.
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

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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
