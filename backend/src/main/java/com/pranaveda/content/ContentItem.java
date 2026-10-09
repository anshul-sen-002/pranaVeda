package com.pranaveda.content;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import com.pranaveda.category.Category;
import com.pranaveda.category.Tag;

/**
 * A yoga content item (asana / article / video). Schema is Flyway-owned
 * (V3__content_library.sql). Publication visibility is NOT encoded here -
 * the service layer decides who may see which status (architecture section 4).
 */
@Entity
@Table(name = "content_items")
public class ContentItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slug", nullable = false, length = 160, unique = true)
    private String slug;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "summary", length = 500)
    private String summary;

    @Column(name = "description")
    private String description;

    @Column(name = "common_name", length = 120)
    private String commonName;

    @Column(name = "sanskrit_name", length = 160)
    private String sanskritName;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length = 16)
    private ContentType contentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private ContentStatus status = ContentStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", length = 16)
    private Difficulty difficulty;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "featured_image_url", length = 500)
    private String featuredImageUrl;

    @Column(name = "instructions")
    private String instructions;

    @Column(name = "breathing_notes")
    private String breathingNotes;

    @Column(name = "modifications")
    private String modifications;

    @Column(name = "safety_precautions")
    private String safetyPrecautions;

    @Column(name = "benefits")
    private String benefits;

    @Column(name = "evidence_notes")
    private String evidenceNotes;

    @Column(name = "seo_title", length = 200)
    private String seoTitle;

    @Column(name = "seo_description", length = 300)
    private String seoDescription;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "published_at")
    private Instant publishedAt;

    @ManyToMany
    @JoinTable(
        name = "content_categories",
        joinColumns = @JoinColumn(name = "content_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id"))
    private Set<Category> categories = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
        name = "content_tags",
        joinColumns = @JoinColumn(name = "content_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags = new LinkedHashSet<>();

    // Goals / target areas live in content_item_facets, written and read by
    // content id (no JPA association keeps list queries join-free).

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // --- getters / setters -------------------------------------------------

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCommonName() {
        return commonName;
    }

    public void setCommonName(String commonName) {
        this.commonName = commonName;
    }

    public String getSanskritName() {
        return sanskritName;
    }

    public void setSanskritName(String sanskritName) {
        this.sanskritName = sanskritName;
    }

    public ContentType getContentType() {
        return contentType;
    }

    public void setContentType(ContentType contentType) {
        this.contentType = contentType;
    }

    public ContentStatus getStatus() {
        return status;
    }

    public void setStatus(ContentStatus status) {
        this.status = status;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getFeaturedImageUrl() {
        return featuredImageUrl;
    }

    public void setFeaturedImageUrl(String featuredImageUrl) {
        this.featuredImageUrl = featuredImageUrl;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getBreathingNotes() {
        return breathingNotes;
    }

    public void setBreathingNotes(String breathingNotes) {
        this.breathingNotes = breathingNotes;
    }

    public String getModifications() {
        return modifications;
    }

    public void setModifications(String modifications) {
        this.modifications = modifications;
    }

    public String getSafetyPrecautions() {
        return safetyPrecautions;
    }

    public void setSafetyPrecautions(String safetyPrecautions) {
        this.safetyPrecautions = safetyPrecautions;
    }

    public String getBenefits() {
        return benefits;
    }

    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }

    public String getEvidenceNotes() {
        return evidenceNotes;
    }

    public void setEvidenceNotes(String evidenceNotes) {
        this.evidenceNotes = evidenceNotes;
    }

    public String getSeoTitle() {
        return seoTitle;
    }

    public void setSeoTitle(String seoTitle) {
        this.seoTitle = seoTitle;
    }

    public String getSeoDescription() {
        return seoDescription;
    }

    public void setSeoDescription(String seoDescription) {
        this.seoDescription = seoDescription;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
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

    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }

    public Set<Category> getCategories() {
        return categories;
    }

    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }

    public Set<Tag> getTags() {
        return tags;
    }

    public void setTags(Set<Tag> tags) {
        this.tags = tags;
    }
}

