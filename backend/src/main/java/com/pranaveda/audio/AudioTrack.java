package com.pranaveda.audio;

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
 * A calm-music / ambience track in the audio studio (agents.md 2.12).
 *
 * <p>Stores only metadata - the actual audio lives in object storage, reached
 * through a {@link com.pranaveda.media.MediaAsset} referenced by
 * {@code audioAssetId}; the cover art is another media asset
 * ({@code coverAssetId}). The schema is Hibernate-owned from this mapping.
 *
 * <p>{@code streamable} and {@code downloadable} are the two independent
 * permissions agents.md 2.7/2.12 require: a public track may be streamable by
 * anyone while its original file is only downloadable by a signed-in member
 * under a downloadable license. A stream-only track sets
 * {@code downloadable=false} and the UI explains it cannot be saved offline.
 *
 * <p>{@code license} and {@code attribution} capture the creator/license details
 * an admin must record before publishing third-party ambience, so the product
 * never distributes unlicensed media.
 */
@Entity
@Table(name = "audio_tracks",
    uniqueConstraints = @UniqueConstraint(name = "uq_audio_tracks_slug", columnNames = "slug"),
    indexes = {
        @Index(name = "ix_audio_tracks_status", columnList = "status"),
        @Index(name = "ix_audio_tracks_category", columnList = "category"),
        @Index(name = "ix_audio_tracks_published", columnList = "published_at DESC")})
@Checks({
    @Check(constraints = "status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')"),
    @Check(constraints = "duration_secs IS NULL OR duration_secs >= 0")})
public class AudioTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "slug", nullable = false, length = 200)
    private String slug;

    @Column(name = "description", length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 24)
    private AudioCategory category;

    /** Duration in seconds for display; the source of truth is the media asset. */
    @Column(name = "duration_secs")
    private Integer durationSecs;

    /** Comma-separated tags for filtering; kept simple like content tags. */
    @Column(name = "tags", length = 500)
    private String tags;

    /** The AUDIO media asset this track streams from. */
    @Column(name = "audio_asset_id")
    private Long audioAssetId;

    /** Optional cover-art media asset. */
    @Column(name = "cover_asset_id")
    private Long coverAssetId;

    /** Anyone (including anonymous) may stream when true. */
    @Column(name = "streamable", nullable = false)
    private boolean streamable = true;

    /** A signed-in member may download the original when true (downloadable license). */
    @Column(name = "downloadable", nullable = false)
    private boolean downloadable = false;

    /** Creator / license name recorded by the admin (agents.md 2.12). */
    @Column(name = "creator", length = 200)
    private String creator;

    @Column(name = "license", length = 200)
    private String license;

    @Column(name = "attribution", length = 500)
    private String attribution;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private AudioStatus status = AudioStatus.DRAFT;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "published_at")
    private Instant publishedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == AudioStatus.PUBLISHED && this.publishedAt == null) {
            this.publishedAt = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
        if (this.status == AudioStatus.PUBLISHED && this.publishedAt == null) {
            this.publishedAt = Instant.now();
        }
    }

    // --- getters / setters -------------------------------------------------

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public AudioCategory getCategory() {
        return category;
    }

    public void setCategory(AudioCategory category) {
        this.category = category;
    }

    public Integer getDurationSecs() {
        return durationSecs;
    }

    public void setDurationSecs(Integer durationSecs) {
        this.durationSecs = durationSecs;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public Long getAudioAssetId() {
        return audioAssetId;
    }

    public void setAudioAssetId(Long audioAssetId) {
        this.audioAssetId = audioAssetId;
    }

    public Long getCoverAssetId() {
        return coverAssetId;
    }

    public void setCoverAssetId(Long coverAssetId) {
        this.coverAssetId = coverAssetId;
    }

    public boolean isStreamable() {
        return streamable;
    }

    public void setStreamable(boolean streamable) {
        this.streamable = streamable;
    }

    public boolean isDownloadable() {
        return downloadable;
    }

    public void setDownloadable(boolean downloadable) {
        this.downloadable = downloadable;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getLicense() {
        return license;
    }

    public void setLicense(String license) {
        this.license = license;
    }

    public String getAttribution() {
        return attribution;
    }

    public void setAttribution(String attribution) {
        this.attribution = attribution;
    }

    public AudioStatus getStatus() {
        return status;
    }

    public void setStatus(AudioStatus status) {
        this.status = status;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }
}
