package com.pranaveda.wellness;

import java.time.Instant;
import java.time.LocalDate;

import com.pranaveda.content.Difficulty;

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

/**
 * A user's optional wellness profile (agents.md 2.8). Every field except the
 * owner is optional - the platform never requires personal data to browse.
 *
 * <p>{@code aiPersonalizationConsent} is stored explicitly and separately from
 * the health values, so the AI companion can check consent before any profile
 * data is used for personalization. BMI is never stored - it is derived on
 * demand and always presented as a limited screening metric, not a diagnosis.
 *
 * <p>This is the most private data in the platform: owner-only, never surfaced
 * to admin analytics, and deletable at will.
 */
@Entity
@Table(name = "wellness_profiles",
    uniqueConstraints = @UniqueConstraint(name = "uq_wellness_profiles_user", columnNames = "user_id"),
    indexes = @Index(name = "ix_wellness_profiles_user", columnList = "user_id"))
public class WellnessProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** Date of birth - age is derived from this, never stored separately. */
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "height_value")
    private Double heightValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "height_unit", length = 8)
    private HeightUnit heightUnit;

    @Column(name = "weight_value")
    private Double weightValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "weight_unit", length = 8)
    private WeightUnit weightUnit;

    /** Experience level, reusing the content {@link Difficulty} vocabulary. */
    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", length = 16)
    private Difficulty experienceLevel;

    @Column(name = "preferred_session_minutes")
    private Integer preferredSessionMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "practice_time", length = 12)
    private PracticeTime practiceTime;

    /**
     * IANA timezone id (e.g. "Asia/Kolkata") used for timezone-aware streak day
     * boundaries (agents.md 2.11). Optional; the backend falls back to UTC when
     * unset or unrecognised. Never affects any health interpretation.
     */
    @Column(name = "timezone", length = 64)
    private String timezone;

    /** Self-reported 1-5 scales; never interpreted as clinical measures. */
    @Column(name = "sleep_quality")
    private Integer sleepQuality;

    @Column(name = "energy_level")
    private Integer energyLevel;

    @Column(name = "mood_score")
    private Integer moodScore;

    @Column(name = "flexibility_score")
    private Integer flexibilityScore;

    /** Optional constraints (e.g. "knee injury") used to soften recommendations. */
    @Column(name = "constraints_notes", length = 1000)
    private String constraintsNotes;

    /**
     * Explicit consent to use this profile to personalize AI responses
     * (agents.md 2.8). Off by default; the AI must not send profile data to the
     * provider unless this is true and the data is relevant.
     */
    @Column(name = "ai_personalization_consent", nullable = false)
    private boolean aiPersonalizationConsent = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public Double getHeightValue() {
        return heightValue;
    }

    public void setHeightValue(Double heightValue) {
        this.heightValue = heightValue;
    }

    public HeightUnit getHeightUnit() {
        return heightUnit;
    }

    public void setHeightUnit(HeightUnit heightUnit) {
        this.heightUnit = heightUnit;
    }

    public Double getWeightValue() {
        return weightValue;
    }

    public void setWeightValue(Double weightValue) {
        this.weightValue = weightValue;
    }

    public WeightUnit getWeightUnit() {
        return weightUnit;
    }

    public void setWeightUnit(WeightUnit weightUnit) {
        this.weightUnit = weightUnit;
    }

    public Difficulty getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(Difficulty experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public Integer getPreferredSessionMinutes() {
        return preferredSessionMinutes;
    }

    public void setPreferredSessionMinutes(Integer preferredSessionMinutes) {
        this.preferredSessionMinutes = preferredSessionMinutes;
    }

    public PracticeTime getPracticeTime() {
        return practiceTime;
    }

    public void setPracticeTime(PracticeTime practiceTime) {
        this.practiceTime = practiceTime;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public Integer getSleepQuality() {
        return sleepQuality;
    }

    public void setSleepQuality(Integer sleepQuality) {
        this.sleepQuality = sleepQuality;
    }

    public Integer getEnergyLevel() {
        return energyLevel;
    }

    public void setEnergyLevel(Integer energyLevel) {
        this.energyLevel = energyLevel;
    }

    public Integer getMoodScore() {
        return moodScore;
    }

    public void setMoodScore(Integer moodScore) {
        this.moodScore = moodScore;
    }

    public Integer getFlexibilityScore() {
        return flexibilityScore;
    }

    public void setFlexibilityScore(Integer flexibilityScore) {
        this.flexibilityScore = flexibilityScore;
    }

    public String getConstraintsNotes() {
        return constraintsNotes;
    }

    public void setConstraintsNotes(String constraintsNotes) {
        this.constraintsNotes = constraintsNotes;
    }

    public boolean isAiPersonalizationConsent() {
        return aiPersonalizationConsent;
    }

    public void setAiPersonalizationConsent(boolean aiPersonalizationConsent) {
        this.aiPersonalizationConsent = aiPersonalizationConsent;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
