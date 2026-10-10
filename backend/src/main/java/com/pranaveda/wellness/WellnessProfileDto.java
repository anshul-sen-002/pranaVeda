package com.pranaveda.wellness;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;

import com.pranaveda.content.Difficulty;

/**
 * Safe view of a wellness profile. Owner-only. Age is derived from date of
 * birth, never stored. BMI is computed on demand (never persisted) and always
 * returned alongside a disclaimer - it is a limited screening metric, not a
 * measure of health, and never a diagnosis (agents.md 2.8).
 *
 * @param bmiOrNull derived BMI in metric units, or null when height/weight are
 *                  insufficient to compute it
 * @param bmiAvailable whether {@code bmiOrNull} could be computed this request
 */
public record WellnessProfileDto(
        Long id,
        LocalDate dateOfBirth,
        Integer age,
        Double heightValue,
        HeightUnit heightUnit,
        Double weightValue,
        WeightUnit weightUnit,
        Difficulty experienceLevel,
        Integer preferredSessionMinutes,
        PracticeTime practiceTime,
        String timezone,
        Integer sleepQuality,
        Integer energyLevel,
        Integer moodScore,
        Integer flexibilityScore,
        String constraintsNotes,
        boolean aiPersonalizationConsent,
        Double bmiOrNull,
        boolean bmiAvailable,
        Instant createdAt,
        Instant updatedAt) {

    /** Human-readable BMI caveat the frontend must render whenever BMI is shown. */
    public static final String BMI_DISCLAIMER =
        "BMI is a limited screening metric based only on height and weight. It does not "
      + "account for muscle mass, body composition, age, or fitness, is not a measure of "
      + "overall health, and is never a diagnosis.";

    static WellnessProfileDto from(WellnessProfile p) {
        Double bmi = computeBmi(p);
        return new WellnessProfileDto(
            p.getId(),
            p.getDateOfBirth(),
            ageFrom(p.getDateOfBirth()),
            p.getHeightValue(),
            p.getHeightUnit(),
            p.getWeightValue(),
            p.getWeightUnit(),
            p.getExperienceLevel(),
            p.getPreferredSessionMinutes(),
            p.getPracticeTime(),
            p.getTimezone(),
            p.getSleepQuality(),
            p.getEnergyLevel(),
            p.getMoodScore(),
            p.getFlexibilityScore(),
            p.getConstraintsNotes(),
            p.isAiPersonalizationConsent(),
            bmi,
            bmi != null,
            p.getCreatedAt(),
            p.getUpdatedAt());
    }

    private static Integer ageFrom(LocalDate dob) {
        return dob == null ? null : Period.between(dob, LocalDate.now()).getYears();
    }

    /**
     * Derives BMI (kg/m^2) after normalizing either unit system. Returns null
     * when a value or unit is missing - the UI then hides BMI rather than
     * showing a misleading number.
     */
    private static Double computeBmi(WellnessProfile p) {
        if (p.getHeightValue() == null || p.getHeightUnit() == null
            || p.getWeightValue() == null || p.getWeightUnit() == null) {
            return null;
        }
        double heightCm = p.getHeightUnit() == HeightUnit.CM
            ? p.getHeightValue()
            : p.getHeightValue() * 2.54; // IN -> cm
        double weightKg = p.getWeightUnit() == WeightUnit.KG
            ? p.getWeightValue()
            : p.getWeightValue() * 0.45359237; // LB -> kg
        if (heightCm <= 0 || weightKg <= 0) {
            return null;
        }
        double heightM = heightCm / 100.0;
        return Math.round((weightKg / (heightM * heightM)) * 10.0) / 10.0;
    }
}
