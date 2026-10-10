package com.pranaveda.wellness;

import java.time.LocalDate;

import com.pranaveda.content.Difficulty;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Upsert payload for the wellness profile (agents.md 2.8). Every field is
 * optional - a user may save an empty profile. The personalization-consent flag
 * is a deliberate, separate choice and defaults to false when omitted.
 */
public record WellnessProfileRequest(
        @Past(message = "Date of birth must be in the past.") LocalDate dateOfBirth,
        @Positive Double heightValue,
        HeightUnit heightUnit,
        @Positive Double weightValue,
        WeightUnit weightUnit,
        Difficulty experienceLevel,
        @Min(5) @Max(240) Integer preferredSessionMinutes,
        PracticeTime practiceTime,
        @Min(1) @Max(5) Integer sleepQuality,
        @Min(1) @Max(5) Integer energyLevel,
        @Min(1) @Max(5) Integer moodScore,
        @Min(1) @Max(5) Integer flexibilityScore,
        @Size(max = 64, message = "Timezone must be a valid IANA zone id, e.g. Asia/Kolkata.")
        String timezone,
        String constraintsNotes,
        Boolean aiPersonalizationConsent) {
}
