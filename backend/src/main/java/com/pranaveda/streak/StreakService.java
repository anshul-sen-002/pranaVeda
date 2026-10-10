package com.pranaveda.streak;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Set;
import java.util.stream.Collectors;

import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.session.PracticeSession;
import com.pranaveda.session.PracticeSessionRepository;
import com.pranaveda.user.UserRepository;
import com.pranaveda.wellness.WellnessProfileRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Streak computation (agents.md 2.11). The backend is the single source of
 * truth: streaks are derived here from recorded practice sessions, never
 * calculated in the browser.
 *
 * <p>Day boundaries are timezone-aware. Each session's {@code completedAt}
 * instant is converted to a local date in the user's chosen IANA timezone
 * (falling back to UTC when unset or unrecognised), then the distinct local
 * days feed {@link StreakCalculator}. Because sessions are stored as UTC
 * instants, the same session can map to different local days as the timezone
 * changes - which is exactly the correct behaviour.
 */
@Service
public class StreakService {

    /**
     * Lookback window for distinct practice days. Generous enough to cover a
     * very long unbroken streak while bounding the query.
     */
    private static final int LOOKBACK_DAYS = 400;

    private final PracticeSessionRepository sessions;
    private final WellnessProfileRepository profiles;
    private final UserRepository users;

    public StreakService(PracticeSessionRepository sessions,
                         WellnessProfileRepository profiles,
                         UserRepository users) {
        this.sessions = sessions;
        this.profiles = profiles;
        this.users = users;
    }

    /** The caller's current streak snapshot. Owner-scoped. */
    @Transactional(readOnly = true)
    public StreakDto current() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        ZoneId zone = resolveZone(userId);
        LocalDate today = LocalDate.now(zone);

        Instant from = today.minusDays(LOOKBACK_DAYS).atStartOfDay(zone).toInstant();
        Set<LocalDate> practiceDays = sessions.findRecentForStreak(userId, from).stream()
                .map(session -> localDate(session, zone))
                .collect(Collectors.toSet());

        StreakCalculator.StreakResult result = StreakCalculator.compute(practiceDays, today);
        return new StreakDto(
                result.currentStreak(),
                result.longestStreak(),
                result.practisedToday(),
                result.practisedYesterday(),
                result.broken(),
                zone.getId(),
                today);
    }

    /**
     * Resolves the user's timezone: their profile choice if it is a valid IANA
     * id, otherwise UTC. Never throws for a bad value - an unknown zone simply
     * falls back so streak display keeps working.
     */
    private ZoneId resolveZone(long userId) {
        // Confirm the account still exists (404 if removed under us).
        if (!users.existsById(userId)) {
            throw new com.pranaveda.common.error.NotFoundException("User not found.");
        }
        return profiles.findByUserId(userId)
                .map(profile -> zoneFrom(profile.getTimezone()))
                .orElse(StreakDto.DEFAULT_ZONE);
    }

    private static ZoneId zoneFrom(String raw) {
        if (raw == null || raw.isBlank()) {
            return StreakDto.DEFAULT_ZONE;
        }
        try {
            return ZoneId.of(raw.trim());
        } catch (Exception invalid) {
            return StreakDto.DEFAULT_ZONE;
        }
    }

    private static LocalDate localDate(PracticeSession session, ZoneId zone) {
        return session.getCompletedAt().atZone(zone).toLocalDate();
    }
}
