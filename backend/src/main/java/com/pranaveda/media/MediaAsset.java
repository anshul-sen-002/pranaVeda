package com.pranaveda.media;

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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;

/**
 * Object-store METADATA for an uploaded asset (architecture sections 7 and 9).
 * Never stores binary payloads - {@code publicId} and {@code secureUrl} point
 * at the Cloudinary object. The schema is Hibernate-owned from this mapping.
 *
 * <p>{@code ownerId} is set for personal uploads (profile photos) and null for
 * platform/admin content. {@code contentId} optionally links an asset to the
 * content item it illustrates.
 */
@Entity
@Table(name = "media_assets",
    uniqueConstraints = @UniqueConstraint(name = "uq_media_public_id", columnNames = "public_id"),
    indexes = {
        @Index(name = "ix_media_assets_kind", columnList = "kind"),
        @Index(name = "ix_media_assets_owner", columnList = "owner_id"),
        @Index(name = "ix_media_assets_content", columnList = "content_id"),
        @Index(name = "ix_media_assets_created", columnList = "created_at DESC")})
@Checks({
    @Check(constraints = "kind IN ('PROFILE_IMAGE', 'CONTENT_IMAGE', 'VIDEO', 'AUDIO')"),
    @Check(constraints = "bytes IS NULL OR bytes >= 0")})
public class MediaAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false, length = 24)
    private MediaKind kind;

    @Column(name = "public_id", nullable = false, length = 255)
    private String publicId;

    @Column(name = "secure_url", nullable = false, length = 500)
    private String secureUrl;

    @Column(name = "resource_type", length = 24)
    private String resourceType;

    @Column(name = "format", length = 24)
    private String format;

    @Column(name = "bytes")
    private Long bytes;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Column(name = "duration_secs")
    private Double durationSecs;

    @Column(name = "original_name", length = 255)
    private String originalName;

    @Column(name = "owner_id")
    private Long ownerId;

    @Column(name = "content_id")
    private Long contentId;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    // --- getters / setters -------------------------------------------------

    public Long getId() {
        return id;
    }

    public MediaKind getKind() {
        return kind;
    }

    public void setKind(MediaKind kind) {
        this.kind = kind;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public String getSecureUrl() {
        return secureUrl;
    }

    public void setSecureUrl(String secureUrl) {
        this.secureUrl = secureUrl;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public Long getBytes() {
        return bytes;
    }

    public void setBytes(Long bytes) {
        this.bytes = bytes;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Double getDurationSecs() {
        return durationSecs;
    }

    public void setDurationSecs(Double durationSecs) {
        this.durationSecs = durationSecs;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public Long getContentId() {
        return contentId;
    }

    public void setContentId(Long contentId) {
        this.contentId = contentId;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
