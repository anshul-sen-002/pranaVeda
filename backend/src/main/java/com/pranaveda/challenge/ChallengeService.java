package com.pranaveda.challenge;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.user.UserRepository;
import com.pranaveda.wellness.WellnessProfileRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 7-day challenge participation (agents.md 2.11).
 *
 * <p>The backend is authoritative: completion is recorded per user-local day
 * and made idempotent both by a pre-check and by the DB unique constraint on
 * (participation, practice_date), so retries never double-count a day. A humane
 * missed-day policy applies - the challenge never resets or shames a member for
 * a missed day; they simply complete more days.
 *
 * <p>Timezone-aware day boundaries reuse the member's profile timezone, exactly
 * like streaks.
 */
@Service
public class ChallengeService {

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("UTC");

    private final ChallengeRepository challenges;
    private final ChallengeParticipationRepository participations;
    private final ChallengeDayCompletionRepository dayCompletions;
    private final WellnessProfileRepository profiles;
    private final UserRepository users;

    public ChallengeService(ChallengeRepository challenges,
                            ChallengeParticipationRepository participations,
                            ChallengeDayCompletionRepository dayCompletions,
                            WellnessProfileRepository profiles,
                            UserRepository users) {
        this.challenges = challenges;
        this.participations = participations;
        this.dayCompletions = dayCompletions;
        this.profiles = profiles;
        this.users = users;
    }

    /** Published challenges only - drafts/archived are never listed publicly. */
    @Transactional(readOnly = true)
    public List<ChallengeDto> listPublished() {
        return challenges.findByStatusOrderByCreatedAtAsc(ChallengeStatus.PUBLISHED).stream()
                .map(ChallengeDto::from)
                .toList();
    }

    /** A single published challenge by id (404 if missing or not published). */
    @Transactional(readOnly = true)
    public ChallengeDto getPublished(long id) {
        return ChallengeDto.from(loadPublished(id));
    }

    /**
     * Joins a published challenge. Idempotent: joining again returns the
     * existing participation rather than creating a duplicate (the unique
     * constraint also guards this at the DB level).
     */
    @Transactional
    public ChallengeProgressDto join(long challengeId) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        requireUser(userId);
        Challenge challenge = loadPublished(challengeId);

        ChallengeParticipation participation = participations
                .findByUserIdAndChallengeId(userId, challengeId)
                .orElseGet(() -> {
                    ChallengeParticipation created = new ChallengeParticipation();
                    created.setUserId(userId);
                    created.setChallengeId(challengeId);
                    return participations.save(created);
                });
        return progress(challenge, participation);
    }

    /** The caller's progress in a challenge they have joined. */
    @Transactional(readOnly = true)
    public ChallengeProgressDto progress(long challengeId) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        Challenge challenge = loadPublished(challengeId);
        ChallengeParticipation participation = participations
                .findByUserIdAndChallengeId(userId, challengeId)
                .orElseThrow(() -> new NotFoundException("You have not joined this challenge."));
        return progress(challenge, participation);
    }

    /** All challenges the caller has joined, newest first, with progress. */
    @Transactional(readOnly = true)
    public List<ChallengeProgressDto> myParticipations() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        return participations.findByUserIdOrderByStartedAtDesc(userId).stream()
                .map(participation -> progress(loadChallenge(participation.getChallengeId()), participation))
                .toList();
    }


    /**
     * Marks today's challenge day complete (agents.md 2.11). Idempotent: a
     * second call for the same user-local day returns the current progress
     * without recording a duplicate. The reported minutes must meet the
     * challenge's daily goal, and the caller must have joined.
     */
    @Transactional
    public ChallengeProgressDto completeDay(long challengeId, CompleteDayRequest request) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        requireUser(userId);
        Challenge challenge = loadPublished(challengeId);

        if (request.minutes() < challenge.getDailyGoalMinutes()) {
            throw new BadRequestException("A challenge day requires at least "
                    + challenge.getDailyGoalMinutes() + " minutes of practice.");
        }

        ChallengeParticipation participation = participations
                .findByUserIdAndChallengeId(userId, challengeId)
                .orElseThrow(() -> new NotFoundException("You have not joined this challenge."));

        ZoneId zone = resolveZone(userId);
        LocalDate today = LocalDate.now(zone);

        // Idempotency: if today is already recorded, do not double-count.
        if (!dayCompletions.existsByParticipationIdAndPracticeDate(
                participation.getId(), today)) {
            ChallengeDayCompletion completion = new ChallengeDayCompletion();
            completion.setParticipationId(participation.getId());
            completion.setPracticeDate(today);
            completion.setMinutesLogged(request.minutes());
            dayCompletions.save(completion);
        }
        return progress(challenge, participation);
    }

    /**
     * Leaves a challenge. Deletes the participation and its day completions.
     * Deleting a challenge participation never touches practice history - it is
     * a challenge-scoped choice only.
     */
    @Transactional
    public void leave(long challengeId) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        ChallengeParticipation participation = participations
                .findByUserIdAndChallengeId(userId, challengeId)
                .orElseThrow(() -> new NotFoundException("You have not joined this challenge."));
        dayCompletions.deleteByParticipationId(participation.getId());
        participations.delete(participation);
    }

    // --- helpers -----------------------------------------------------------

    private ChallengeProgressDto progress(Challenge challenge, ChallengeParticipation participation) {
        List<LocalDate> practiceDates = dayCompletions
                .findByParticipationIdOrderByPracticeDateAsc(participation.getId()).stream()
                .map(ChallengeDayCompletion::getPracticeDate)
                .collect(Collectors.toList());
        List<String> badges = ChallengeBadges.earned(practiceDates.size(), challenge.getDurationDays());
        return ChallengeProgressDto.of(challenge, participation, practiceDates, badges);
    }

    private Challenge loadPublished(long challengeId) {
        Challenge challenge = loadChallenge(challengeId);
        if (challenge.getStatus() != ChallengeStatus.PUBLISHED) {
            throw new NotFoundException("Challenge not found.");
        }
        return challenge;
    }

    private Challenge loadChallenge(long challengeId) {
        return challenges.findById(challengeId)
                .orElseThrow(() -> new NotFoundException("Challenge not found."));
    }

    private void requireUser(long userId) {
        if (!users.existsById(userId)) {
            throw new NotFoundException("User not found.");
        }
    }

    private ZoneId resolveZone(long userId) {
        return profiles.findByUserId(userId)
                .map(profile -> zoneFrom(profile.getTimezone()))
                .orElse(DEFAULT_ZONE);
    }

    private static ZoneId zoneFrom(String raw) {
        if (raw == null || raw.isBlank()) {
            return DEFAULT_ZONE;
        }
        try {
            return ZoneId.of(raw.trim());
        } catch (Exception invalid) {
            return DEFAULT_ZONE;
        }
    }
}

