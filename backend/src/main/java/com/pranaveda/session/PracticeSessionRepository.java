package com.pranaveda.session;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Practice-session persistence (agents.md 2.9). Every method is scoped to a
 * {@code userId} taken from the security context, so a user can only ever read,
 * mutate, or delete their own sessions (IDOR rule, architecture section 6).
 *
 * <p>Window aggregates ({@code countBetween}, {@code sumMinutesBetween}) are
 * computed in SQL so dashboard stats stay correct as history grows. Streak
 * day-boundary work (feature #5) reuses {@link #findRecentForStreak}.
 */
public interface PracticeSessionRepository extends JpaRepository<PracticeSession, Long> {

    Optional<PracticeSession> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);

    Page<PracticeSession> findByUserIdOrderByCompletedAtDesc(Long userId, Pageable pageable);

    long countByUserId(Long userId);

    /** Total practised minutes across all time; null when the user has none. */
    @Query("SELECT SUM(s.durationMinutes) FROM PracticeSession s WHERE s.userId = :userId")
    Long sumMinutesByUserId(@Param("userId") Long userId);

    /** Number of completed sessions in the half-open window [from, to). */
    @Query("""
        SELECT COUNT(s) FROM PracticeSession s
        WHERE s.userId = :userId AND s.completedAt >= :from AND s.completedAt < :to
        """)
    long countBetween(@Param("userId") Long userId,
                      @Param("from") Instant from,
                      @Param("to") Instant to);

    /** Summed minutes in the half-open window [from, to); null when none. */
    @Query("""
        SELECT SUM(s.durationMinutes) FROM PracticeSession s
        WHERE s.userId = :userId AND s.completedAt >= :from AND s.completedAt < :to
        """)
    Long sumMinutesBetween(@Param("userId") Long userId,
                           @Param("from") Instant from,
                           @Param("to") Instant to);

    /**
     * All sessions at/after a point in time, oldest first. Feature #5 loads the
     * distinct local practice days from this to build timezone-aware streaks on
     * the server - the frontend never computes streaks (agents.md 2.11).
     */
    @Query("""
        SELECT s FROM PracticeSession s
        WHERE s.userId = :userId AND s.completedAt >= :from
        ORDER BY s.completedAt ASC
        """)
    List<PracticeSession> findRecentForStreak(@Param("userId") Long userId,
                                              @Param("from") Instant from);
}
