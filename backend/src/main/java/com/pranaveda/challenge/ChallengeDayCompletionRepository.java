package com.pranaveda.challenge;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Idempotent per-day completions for a participation (agents.md 2.11). */
public interface ChallengeDayCompletionRepository extends JpaRepository<ChallengeDayCompletion, Long> {

    List<ChallengeDayCompletion> findByParticipationIdOrderByPracticeDateAsc(Long participationId);

    boolean existsByParticipationIdAndPracticeDate(Long participationId, LocalDate practiceDate);

    long countByParticipationId(Long participationId);

    /** Bulk delete (executes immediately) when a member leaves a challenge. */
    @Modifying
    @Query("DELETE FROM ChallengeDayCompletion d WHERE d.participationId = :participationId")
    void deleteByParticipationId(@Param("participationId") Long participationId);
}
