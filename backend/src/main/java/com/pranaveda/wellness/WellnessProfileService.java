package com.pranaveda.wellness;

import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.user.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Wellness profile CRUD (agents.md 2.8). Every operation resolves the owner
 * from the security context, so a user can only ever read or write their own
 * profile (IDOR rule, architecture section 6). This data is never exposed to
 * admin analytics.
 *
 * <p>Handles the four personal-data rights from agents.md: read (get), edit
 * (upsert), export (export), and delete (delete). BMI is derived in the DTO,
 * never persisted.
 */
@Service
public class WellnessProfileService {

    private final WellnessProfileRepository profiles;
    private final UserRepository users;

    public WellnessProfileService(WellnessProfileRepository profiles, UserRepository users) {
        this.profiles = profiles;
        this.users = users;
    }

    /** Current user's profile. Creates an empty one on first read if none exists. */
    @Transactional
    public WellnessProfileDto get() {
        return WellnessProfileDto.from(findOrCreate());
    }

    /** Full update of the caller's profile. All fields optional; null clears. */
    @Transactional
    public WellnessProfileDto upsert(WellnessProfileRequest request) {
        validateUnitPairing(request);
        WellnessProfile profile = findOrCreate();

        profile.setDateOfBirth(request.dateOfBirth());
        profile.setHeightValue(request.heightValue());
        profile.setHeightUnit(request.heightUnit());
        profile.setWeightValue(request.weightValue());
        profile.setWeightUnit(request.weightUnit());
        profile.setExperienceLevel(request.experienceLevel());
        profile.setPreferredSessionMinutes(request.preferredSessionMinutes());
        profile.setPracticeTime(request.practiceTime());
        profile.setTimezone(trimToNull(request.timezone()));
        profile.setSleepQuality(request.sleepQuality());
        profile.setEnergyLevel(request.energyLevel());
        profile.setMoodScore(request.moodScore());
        profile.setFlexibilityScore(request.flexibilityScore());
        profile.setConstraintsNotes(trimToNull(request.constraintsNotes()));
        // Consent is an explicit boolean choice; omitted means withdraw (false).
        profile.setAiPersonalizationConsent(Boolean.TRUE.equals(request.aiPersonalizationConsent()));

        return WellnessProfileDto.from(profiles.save(profile));
    }

    /**
     * Owner-scoped export of the caller's own data (agents.md 2.8 export right).
     * Returns the same safe DTO the UI uses - never the raw entity or any other
     * user's data.
     */
    @Transactional(readOnly = true)
    public WellnessProfileDto export() {
        return WellnessProfileDto.from(findOrCreate());
    }

    /** Deletes the caller's profile. Idempotent - absent profile is a no-op. */
    @Transactional
    public void delete() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        profiles.deleteByUserId(userId);
    }

    // --- helpers -----------------------------------------------------------

    private WellnessProfile findOrCreate() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        // Ensure the user exists (404 if the account was removed under us).
        users.findById(userId).orElseThrow(
            () -> new com.pranaveda.common.error.NotFoundException("User not found."));
        return profiles.findByUserId(userId).orElseGet(() -> {
            WellnessProfile created = new WellnessProfile();
            created.setUserId(userId);
            return profiles.save(created);
        });
    }

    /**
     * A value and its unit must be supplied together - a bare number with no
     * unit (or vice-versa) is ambiguous and would produce a wrong BMI.
     */
    private static void validateUnitPairing(WellnessProfileRequest request) {
        if (request.heightValue() == null && request.heightUnit() != null) {
            throw new BadRequestException("A height unit was given without a height value.");
        }
        if (request.heightValue() != null && request.heightUnit() == null) {
            throw new BadRequestException("A height value was given without a height unit.");
        }
        if (request.weightValue() == null && request.weightUnit() != null) {
            throw new BadRequestException("A weight unit was given without a weight value.");
        }
        if (request.weightValue() != null && request.weightUnit() == null) {
            throw new BadRequestException("A weight value was given without a weight unit.");
        }
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() > 1000 ? trimmed.substring(0, 1000) : trimmed;
    }
}
